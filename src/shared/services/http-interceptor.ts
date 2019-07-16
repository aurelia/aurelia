import { JwtService } from './jwt-service';
import { inject } from '@aurelia/kernel';

const AUTHORIZATION_HEADER = 'Authorization';

@inject(JwtService)
export class HttpInterceptor {

  constructor(private readonly jwtService: JwtService) {
  }

  request(request) {
    if (!this.jwtService.isTokenValid()) {
      return request;
    }

    // Support for http-client
    if (request.headers.add && !request.headers.get(AUTHORIZATION_HEADER)) {
      request.headers.add(AUTHORIZATION_HEADER, this.jwtService.getAuthorizationHeader());
    }

    // Support for fetch-client
    if (request.headers.append && !request.headers.get(AUTHORIZATION_HEADER)) {
      request.headers.append(AUTHORIZATION_HEADER, this.jwtService.getAuthorizationHeader());
    }

    return request;
  };

  response(response) {
    return response;
  };
}
