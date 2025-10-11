export {
  RestResourceConfiguration,
  RestResourceDefaults,
  type RestResourcePluginOptions,
} from './configuration';

export {
  IRestResourceDefaults,
  IRestResourceFactory,
} from './rest-resource-client';

export {
  restResource,
  RestResource,
  getRestResourceDefinition,
  type RestResourceDecorator,
  type RestResourceOptions,
  type RestResourceDefinition,
  type RestResourceEndpoints,
  type RestResourceOperation,
} from './rest-resource';

export {
  RestResourceClient,
  type RestResourceClientRequestOptions,
  type RestResourceClientListOptions,
  type RestResourceClientGetOptions,
  type RestResourceClientMutationOptions,
  type RestResponse,
  type RestBatchRequest,
  type RestAsyncState,
  type RestAsyncStateOptions,
  type RestAsyncStatus,
  RestResourceRequestBuilder,
  type RestResourceInternalRequest,
} from './rest-resource-client';

export {
  type RestResourceCacheKey,
  type RestResourceCacheEntry,
  type IRestResourceCache,
  type RestResourceCacheOptions,
  type RestResourceCacheOperation,
  MemoryRestResourceCache,
} from './rest-resource-cache';

export {
  type RestSerializerInitializeInit,
  type RestResourceSerializerContext,
  type IRestResourceSerializer,
  JsonRestResourceSerializer,
} from './rest-resource-serializer';

export {
  type RestResourcePolicy,
  type RestRequestContext,
  type RestResponseContext,
  type RestErrorContext,
} from './rest-resource-policy';
