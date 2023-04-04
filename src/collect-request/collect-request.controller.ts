import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CollectRequestService } from './collect-request.service';
import { CreateRequestDTO } from './dto/createRequest.dto';
import { DeleteRequestDTO } from './dto/deleteRequest.dto';
import { SubOnRequestDTO } from './dto/subOnRequest.dto';
import { UpdateRequestDTO } from './dto/updateRequest.dto';

@ApiTags('Request')
@SkipThrottle()
@Controller('request')
export class CollectRequestController {
  constructor(private collectRequestService: CollectRequestService) {}

  @Post('/create')
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

  @SkipThrottle(false)
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

  @SkipThrottle(false)
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

  @SkipThrottle(false)
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

  @SkipThrottle(false)
  @Get('/getAllRequestByUserId')
  getAllRequestPerUser(@Headers('Authorization') authorization) {
    const uri = authorization.split(' ')[1];
    return this.collectRequestService.getAllRequest(uri);
  }

  @SkipThrottle(false)
  @Get('/sub/get/:id')
  getSubsByRequestId(@Param('id') id: number) {
    return this.collectRequestService.getSubsByRequestId(id);
  }

  @SkipThrottle(false)
  @Get('/get/:uri')
  getRequestByURI(@Param('uri') uri: string) {
    return this.collectRequestService.getRequestByURI(uri);
  }
}
