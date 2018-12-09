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

  flagExpertise: boolean = false;
  flagInterests : boolean = false;
  userName: string = "";
  technology: any = [];
  business: any = [];
  techSelect: any = [];
  busiSelect: any = [];
  techInterestSelect: any = [];
  busiInterestSelect: any = [];
  techTags: any;
  busiTags: any;
  initialTags: any = [];
  finalTags: any = [];
  initialInterests: any = [];
  finalInterests: any = [];
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

      this.firebaseService.getUserTags().then( res => {
        if(res != null) {
          this.initialTags = res;
          this.populateTags('expertise', this.initialTags);
        }
        this.firebaseService.getUserInterests().then( resp => {
          if (resp != null) {
            this.initialInterests = resp;
            this.populateTags('interests', this.initialInterests);
          }
          this.isLoaded = true;
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  populateTags(type, initial) {
    let tech = [];
    let busi = [];
    for (let i=0; i<initial.length; i++) {
      if (isNaN(initial[i])) {
        if (this.busiTags[initial[i]] != null) {
          busi.push(initial[i]);
        }
      } else {
        if (this.techTags[initial[i]] != null) {
          tech.push(initial[i]);
        }
      }
    }
    if(tech == null)
      initial = busi;
    else if(busi == null)
      initial = tech;
    else
      initial = tech.concat(busi);

    if (type == 'expertise') {
      this.techSelect = tech;
      this.busiSelect = busi;
      this.initialTags = initial;
    }
    else if (type == 'interests') {
      this.techInterestSelect = tech;
      this.busiInterestSelect = busi;
      this.initialInterests = initial;
    }
  }

  saveChanges(type) {
    if (type == 'expertise') {
      this.finalTags = this.getFinalTags(this.techSelect, this.busiSelect);
      this.firebaseService.updateProfile(this.initialTags, this.finalTags);
      this.flagExpertise = false;
      this.initialTags = this.finalTags;
    } 
    else if (type == 'interests') {
      this.finalInterests = this.getFinalTags(this.techInterestSelect, this.busiInterestSelect);
      this.firebaseService.updateInterests(this.finalInterests);
      this.flagInterests = false;
      this.initialInterests = this.finalInterests;
    }

  }

  getFinalTags(tech, busi) {
    let final = [];
    if(tech == null)
      final = busi;
    else if(busi == null)
      final = tech;
    else
      final = tech.concat(busi);
    return final;
  }

  signOut() {
    this.firebaseService.signOut();
    this.navCtrl.setRoot(LoginPage);
    this.app.getRootNav().setRoot(LoginPage);
  }

  enableSave(type) {
    if (type == 'expertise')
      this.flagExpertise=true;
    else if (type == 'interests')
      this.flagInterests = true;
  }

  ask() {
    this.navCtrl.push(AskPage);
  }

}
