import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CollectRequestService } from './collect-request.service';
import { CreateRequestDTO } from './dto/createRequest.dto';
import { DeleteRequestDTO } from './dto/deleteRequest.dto';
import { SubOnRequestDTO } from './dto/subOnRequest.dto';
import { UpdateRequestDTO } from './dto/updateRequest.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@ApiTags('Request')
@SkipThrottle()
@Controller('request')
export class CollectRequestController {
  constructor(private collectRequestService: CollectRequestService) {}

  @Post('/create')
  @SkipThrottle(false)
  @UseGuards(JwtAuthGuard)
  createRequest(
    @Body('title')
    title: string,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.createRequest(
      new CreateRequestDTO({ title, uri }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update')
  updateRequest(
    @Body('title')
    title: string,
    @Body('requestId')
    requestId: number,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.updateRequest(
      new UpdateRequestDTO({ title, uri, requestId }),
    );
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('/sub/')
  subOnRequest(
    @Headers('Authorization') authorization,
    @Body('uri') requestURI: string,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.subOnRequest(
      new SubOnRequestDTO({ requestURI, uri }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getAllRequestByUserId')
  getAllRequestPerUser(@Headers('Authorization') authorization) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.getAllRequest(uri);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/sub/get/:id')
  getSubsByRequestId(
    @Param('id') id: number,
    @Headers('Authorization') authorization,
  ) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.getSubsByRequestId(id, uri);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/:uri')
  getRequestByURI(@Param('uri') uri: string) {
    return this.collectRequestService.getRequestByURI(uri);
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle(false)
  @Post('/claim')
  claimRequest(
    @Headers('Authorization') authorization,
    @Body('uri') uri: string,
  ) {
    const token = authorization.split(' ')[1];
    return this.collectRequestService.claim(token, uri);
  }
}
