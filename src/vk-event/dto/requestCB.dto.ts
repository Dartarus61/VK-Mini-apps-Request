export class RequestCBDTO {
  readonly type: string;
  readonly group_id: number;
  readonly event_id: string;
  readonly object: UserObject;
  readonly v: string;
}

class UserObject {
  readonly user_id: number;
  readonly join_type: string;
  readonly event_id: string;
  readonly peer_id: number;
  readonly payload: {
    uri: string;
  };
}
