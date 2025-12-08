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

    private usersSubject = new BehaviorSubject<UserModel[]>([]);
    userList$: Observable<UserModel[]> = this.usersSubject.asObservable();

    getUsers(): void {
      this._userController.getUsers().subscribe({
        next: (res: any) => {
          this.users.length = 0;
          if(res.status === 200) {
            const usrAccts: UserModel[] = [];
            var data = res.result;
            for(var i = 0; i < data.length; i++) {
              var usr = new UserModel();
              usr.assignData(data[i]);
              usrAccts.push(usr);
            }
            this.usersSubject.next(usrAccts);
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

    updatePassword(newPassword: string): void {
      this._userController.updatePassword(newPassword).subscribe({
        next: (res: any) => {
          if(res.status === 200) {
          }
          alert(res.result);
        }
      })
    }

    updateUserPassword(userid: number, newPassword: string): void {
      this._userController.updateUserPassword(userid, newPassword).subscribe({
        next: (res: any)=> {
          if(res.status === 200) {

          }
          alert(res.result);
        }
      })
    }

    updateUser(user: UserModel): void {
      this._userController.updateUser(user).subscribe({
        next: (res: any) => {
          if(res.status === 200) {

          }
          alert(res.result);
        }
      })
    }

    get currentUser(): UserModel {
      return this.userSubject?.value ?? new UserModel();
    }

    get isAdmin$(): Observable<boolean> {
      return this.user$.pipe(map(usr => usr?.IsAdmin ?? false));
    }
}