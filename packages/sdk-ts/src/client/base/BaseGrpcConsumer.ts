import { grpc } from '@injectivelabs/grpc-web'
import { getGrpcTransport } from '../../utils/grpc'
import { GrpcWebImpl } from './GrpcWebImpl'

export default class BaseGrpcConsumer extends GrpcWebImpl {
  protected module: string = ''

  protected metadata?: grpc.Metadata

  constructor(endpoint: string) {
    super(endpoint, {
      transport: getGrpcTransport(),
    })
  }

  public setMetadata(metadata: grpc.Metadata) {
    this.metadata = metadata
  }

  public clearMetadata() {
    this.metadata = undefined
  }

  public getGrpcWebImpl(endpoint: string) {
    return new BaseGrpcConsumer(endpoint)
  }

  protected retry<TResponse>(
    grpcCall: Function,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<TResponse> {
    const retryGrpcCall = async (attempt = 1): Promise<any> => {
      try {
        return await grpcCall()
      } catch (e: any) {
        if (attempt >= retries) {
          throw e
        }

        return new Promise((resolve) =>
          setTimeout(
            () => resolve(retryGrpcCall(attempt + 1)),
            delay * attempt,
          ),
        )
      }
    }

    return retryGrpcCall()
  }
}
