import { Interceptor } from '@aurelia/fetch-client';
import { DI } from '@aurelia/kernel';

import { IJwtService } from './jwt-service';

const AUTHORIZATION_HEADER = 'Authorization';

export interface IHttpInterceptor extends HttpInterceptor {}
export const IHttpInterceptor = DI.createInterface<IHttpInterceptor>('IHttpInterceptor').withDefault(x => x.singleton(HttpInterceptor));
export class HttpInterceptor implements Interceptor {
  public constructor(
    @IJwtService private readonly jwtService: IJwtService,
  ) {}

  public request(request: Request) {
    if (!this.jwtService.isTokenValid()) {
      return request;
    }
    if (request.headers.append && !request.headers.get(AUTHORIZATION_HEADER)) {
      request.headers.append(AUTHORIZATION_HEADER, this.jwtService.getAuthorizationHeader());
    }
    return request;
  }

  public response(response: Response) {
    return response;
  }
}
