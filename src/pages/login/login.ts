import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { FirebaseService } from '../../services/firebase.service';
import { TabsPage } from '../tabs/tabs';
import { constants } from '../../assets/constants';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constant : any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams, 
              public loading: LoadingController,
              public firebaseService: FirebaseService) {}

  signIn() {
    let loader = this.loading.create({
      content: constants.SIGNING_IN
    });
    loader.present().then(() => {
      this.signInWithGoogle().then(() => {
        this.navCtrl.setRoot(TabsPage);
        loader.dismiss();
      }).catch(error => {
        console.log(error);
        let message = constants.SIGN_IN_ERROR;
        this.firebaseService.presentToast(message);
        this.navCtrl.setRoot(LoginPage);
        loader.dismiss();
      });
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
