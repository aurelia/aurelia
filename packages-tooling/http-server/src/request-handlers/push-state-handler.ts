import { constants } from 'http2';
import { IHttpContext } from '../http-context';
import { IRequestHandler } from '../interfaces';

export class PushStateHandler implements IRequestHandler {
  public async handleRequest(context: IHttpContext): Promise<void> {
    const request = context.request;
    const url = context.requestUrl.href;

    /**
     * Ignore the request if one of the following is condition holds:
     * 1. Not a GET request.
     * 2. Client does not accept html.
     * 3. The path has a dot (.) in the last fragment; dot rule.
     */
    if (
      request.method !== 'GET'
      || !context.getQualifiedRequestHeaderFor(constants.HTTP2_HEADER_ACCEPT).isAccepted('text/html')
      || url.lastIndexOf('.') > url.lastIndexOf('/')
    ) {
      return;
    }

    context.rewriteRequestUrl('/index.html');
  }
}
