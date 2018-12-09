import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { FirebaseService } from '../../services/firebase.service';
import { LoginPage } from '../login/login';
import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-ask',
  templateUrl: 'ask.html',
})
export class AskPage {

  technology: any = [];
  business: any = [];
  techSelect: any = [];
  busiSelect: any = [];
  query = {
    question: "",
    explanation: ""
  };

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public app: App,
              private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    if(this.firebaseService.isSignedIn())
      this.getTags();
    else {
      this.navCtrl.setRoot(LoginPage);
      this.app.getRootNav().setRoot(LoginPage);
    }
  }

  getTags() {
    let tags = this.firebaseService.getTags();
    this.technology = tags[0];
    this.business = tags[1];
    this.business.push({id:"4", name:"General"});
  }

  postQuery() {
    let tags = [];
    if(this.techSelect == null)
      tags = this.busiSelect;
    else if(this.busiSelect == null)
      tags = this.techSelect;
    else
      tags = this.techSelect.concat(this.busiSelect);

    let timestamp = new Date().toISOString();
    timestamp = timestamp.replace(/[^0-9]/g, "");
    this.firebaseService.postQuery(timestamp, this.query, tags);
    this.navCtrl.setRoot(TabsPage);
    this.app.getRootNav().setRoot(TabsPage);
  }
  
}
