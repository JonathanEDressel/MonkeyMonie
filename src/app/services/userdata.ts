import { Injectable, signal } from "@angular/core";
import { UserModel } from "../models/usermodel";
import { UserController } from "./controllers/usercontroller";
import { BehaviorSubject, Observable, map } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class UserData {

    constructor(private _userController: UserController) {}

    users: UserModel[] = [];

    private userSubject = new BehaviorSubject<UserModel | null>(null);
    user$: Observable<UserModel | null> = this.userSubject.asObservable();

    getUsers(): void {
      this._userController.getUsers().subscribe({
        next: (res: any) => {
          this.users.length = 0;
          if(res.status === 200) {
            var data = res.result;
            for(var i = 0; i < data.length; i++) {
              var usr = new UserModel();
              usr.assignData(data[i]);
              this.users.push(usr);
            }
            console.log('Users:', this.users)
          }
        },
        error: (err) => console.error(err)
      });
    }

    getUser(): void {
      this._userController.getUser().subscribe({
        next: (res: any) => {
          if(res.status === 200) {
            var data = res.result;
            var tmp = new UserModel();
            tmp.assignData(data);
            this.userSubject.next(tmp);
          }
        },
        error: (err: any) => console.error(err)
      });
    }

    get currentUser(): UserModel {
      return this.userSubject?.value ?? new UserModel();
    }

    get isAdmin$(): Observable<boolean> {
      return this.user$.pipe(map(usr => usr?.IsAdmin ?? false));
    }
}