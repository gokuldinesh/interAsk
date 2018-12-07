import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { FirebaseService } from '../../services/firebase.service';
import { AskPage } from '../ask/ask';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  flag: boolean = false;
  userName: string = "";
  technology: any = [];
  business: any = [];
  techSelect: any = [];
  busiSelect: any = [];
  techTags: any;
  busiTags: any;
  initialTags: any = [];
  finalTags: any = [];
  isLoaded: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public app: App,
              private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    if(this.firebaseService.isSignedIn()) {
      this.getTags();
      this.getUserProfile();
    }
    else {
      this.navCtrl.setRoot(LoginPage);
      this.app.getRootNav().setRoot(LoginPage);
    }
  }

  getTags() {
    let tags = this.firebaseService.getTags();
    this.technology = tags[0];
    this.business = tags[1];
    this.techTags = tags[2];
    this.busiTags = tags[3];
  }

  getUserProfile() {
    try {
      this.userName = this.firebaseService.getCurrentUserName();

      this.initialTags = this.firebaseService.getUserTags().then( res => {
        if(res != null) {
          this.initialTags = res;
          this.populateTags();
        }
        this.isLoaded = true;
      });
    } catch (error) {
      console.log(error);
    }
  }

  populateTags() {
    for (let i=0; i<this.initialTags.length; i++) {
      if (isNaN(this.initialTags[i])) {
        if (this.busiTags[this.initialTags[i]] != null) {
          this.busiSelect.push(this.initialTags[i]);
        }
      } else {
        if (this.techTags[this.initialTags[i]] != null) {
          this.techSelect.push(this.initialTags[i]);
        }
      }
    }
    if(this.techSelect == null)
      this.initialTags = this.busiSelect;
    else if(this.busiSelect == null)
      this.initialTags = this.techSelect;
    else
      this.initialTags = this.techSelect.concat(this.busiSelect);
  }

  saveChanges() {
    if(this.techSelect == null)
      this.finalTags = this.busiSelect;
    else if(this.busiSelect == null)
      this.finalTags = this.techSelect;
    else
      this.finalTags = this.techSelect.concat(this.busiSelect);
    this.firebaseService.updateProfile(this.initialTags, this.finalTags);
    this.flag = false;
    this.initialTags = this.finalTags;
  }

  signOut() {
    this.firebaseService.signOut();
    this.navCtrl.setRoot(LoginPage);
    this.app.getRootNav().setRoot(LoginPage);
  }

  enableSave() {
    this.flag=true;
  }

  ask() {
    this.navCtrl.push(AskPage);
  }

}
