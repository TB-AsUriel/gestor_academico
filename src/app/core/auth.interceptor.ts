import { inject } from "@angular/core";
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes("/auth/login.php")) {
    return next(req);
  }
  const auth = inject(AuthService);
  const token = auth.token();
  let cloned = req;
  if (token) {
    cloned = req.clone({
      setHeaders: {
        Authorization: "Bearer " + token
      }
    });
  }
  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};