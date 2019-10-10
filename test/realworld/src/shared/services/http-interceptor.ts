import { Interceptor } from '@aurelia/fetch-client';
import { inject } from '@aurelia/kernel';
import { JwtService } from './jwt-service';

const AUTHORIZATION_HEADER = 'Authorization';

@inject(JwtService)
export class HttpInterceptor implements Interceptor {

  public constructor(private readonly jwtService: JwtService) {
  }

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
