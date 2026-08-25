import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly requestCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const start = process.hrtime();
    const route = req.route?.path || req.url;

    return next.handle().pipe(
      tap(() => {
        const statusCode = res.statusCode;
        const diff = process.hrtime(start);
        const duration = diff[0] + diff[1] / 1e9;

        this.requestCounter.inc({
          method: req.method,
          route,
          status_code: statusCode,
        });
        this.requestDuration.observe(
          { method: req.method, route, status_code: statusCode },
          duration,
        );
      }),
    );
  }
}