import {
  Body,
  Controller,
  Delete,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CollectRequestService } from './collect-request.service';
import { CreateRequestDTO } from './dto/createRequest.dto';
import { DeleteRequestDTO } from './dto/deleteRequest.dto';
import { SubOnRequestDTO } from './dto/subOnRequest.dto';
import { UpdateRequestDTO } from './dto/updateRequest.dto';

@ApiTags('Request')
@Controller('request')
export class CollectRequestController {
  constructor(private collectRequestService: CollectRequestService) {}

  @Post('/create')
  createRequest(
    @Body('title')
    title: number,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.createRequest(
      new CreateRequestDTO({ title, uri }),
    );
  }

  @Put('/update')
  updateRequest(
    @Body('title')
    title: number,
    @Body('requestId')
    requestId: number,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.updateRequest(
      new UpdateRequestDTO({ title, uri, requestId }),
    );
  }

  @Delete('/delete/:id')
  deleteRequest(
    @Param('id') requestId: number,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.deleteRequest(
      new DeleteRequestDTO({ requestId, uri }),
    );
  }

  @Post('/sub/:uri')
  subOnRequest(
    @Headers('Authorization') authorization,
    @Param('uri') requestURI: string,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.subOnRequest(
      new SubOnRequestDTO({ requestURI, uri }),
    );
  }
}
