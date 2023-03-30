import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'src/models/request.model';
import { Subcription } from 'src/models/subcriptions.model';
import { UserService } from 'src/user/user.service';
import { CreateRequestDTO } from './dto/createRequest.dto';
import { UpdateRequestDTO } from './dto/updateRequest.dto';

@Injectable()
export class CollectRequestService {
    constructor(
    @InjectModel(Request) private requestRepository: typeof Request, 
    @InjectModel(Subcription) private subcriptionRepository: typeof Subcription,
    private userService: UserService,
    private authService: AuthService){}

    async createRequest(dto: CreateRequestDTO) {
        const user = await this.authService.getUserData(dto.token)

        const request = await user.$create('requests', dto.title)

        const uri = `${user.userId}_${request.id}`

        await request.update('uri', uri)

        return this.requestRepository.findByPk(request.id)
    }

    async updateRequest(dto: UpdateRequestDTO) {
        const user = await this.authService.getUserData(dto.token)

        const request = await this.requestRepository.findByPk(dto.requestId)

        if (!request) {
            throw new HttpException('Request not found', HttpStatus.BAD_REQUEST)
        }

        if (!user.requests.includes(request)) {
            throw new HttpException('Access is not allowed', HttpStatus.FORBIDDEN)
        }

        await request.update('title', dto.title)

        return await this.requestRepository.findByPk(dto.requestId)
    }
}
