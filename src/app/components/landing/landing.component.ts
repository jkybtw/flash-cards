import { Component, OnInit, OnDestroy } from '@angular/core';
import { CrudService } from 'src/app/services/crud.service';
import { Observer, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NGXLogger } from 'ngx-logger';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialog } from '../feedback/feedback.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  loggerString = '[LAND]';
  observer: Observer<boolean>;
  sub: Subscription;
  ready: boolean;
  signedIn: boolean;
  user = null;
  authObserver;
  constructor(
    private crud: CrudService,
    public authService: AuthenticationService,
    private logger: NGXLogger,
    private dialog: MatDialog,
    private snackbar: MatSnackBar) {
    this.logger.debug(this.loggerString, 'Constructing landing page');
    crud.initialize();
    this.authObserver = authService.getAuthStateObservable().subscribe(user => {
      if (user) {
        this.logger.debug(this.loggerString, 'Got User');
        this.signedIn = true;
        this.user = JSON.parse(localStorage.getItem('user'));
        crud.initPreferences();
        crud.initCorrectQuestions();
      } else {
        this.logger.debug(this.loggerString, 'No User found');
        this.signedIn = false;
        this.user = null;
        localStorage.removeItem('user');
      }
    });
  }

  ngOnInit() {
    this.logger.debug(this.loggerString, 'Initialising');
    this.ready = this.crud.getIsReady();
    this.sub = this.crud.getIsReadyObserver().subscribe(x => {
      this.ready = x;
    });
  }

  ngOnDestroy() {
    this.logger.debug(this.loggerString, 'Destroying');
    this.sub.unsubscribe();
    this.authObserver.unsubscribe();
  }

  login() {
    this.logger.debug(this.loggerString, 'Log In');
    this.authService.GoogleAuth();
  }

  signOut() {
    this.logger.debug(this.loggerString, 'Sign out');
    this.crud.signedOut();
    this.authService.SignOut();
    localStorage.removeItem('user');
  }

  openFeedback() {
    this.logger.debug(this.loggerString, 'Opening feedback');
    const dialogRef = this.dialog.open(FeedbackDialog, {
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crud.submitFeedback(result);
        this.snackbar.open('Feedback submitted!', 'Dismiss', {
          duration: 1000
        });
      } else {
        this.snackbar.open('Feedback was not submitted', 'Dismiss', {
          duration: 1000
        });
      }
      this.logger.debug(this.loggerString, 'Closed feedback');
    });
  }
}
