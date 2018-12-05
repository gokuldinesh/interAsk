import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../services/firebase.service';
import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public firebaseService: FirebaseService) {}

  signIn() {
    this.signInWithGoogle().then(() => {
      this.navCtrl.setRoot(TabsPage);
    }).catch(error => {
      console.log(error);
      let message = 'Unable to sign in. Check your internet connection and try again.';
      this.firebaseService.presentToast(message);
      this.navCtrl.setRoot(LoginPage)
    });
  }

  signInWithGoogle() {
    return this.firebaseService.signInWithGoogle();
  }

  isSignedIn() {
    if(this.firebaseService.isSignedIn())
      this.navCtrl.setRoot(TabsPage);
  }

}
