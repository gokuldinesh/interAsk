import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { FirebaseService } from '../../services/firebase.service';
import { QuestionPage } from '../question/question';
import { AskPage } from '../ask/ask';
import { TabsPage } from '../tabs/tabs';

@IonicPage()
@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {

  isLoaded: boolean = false;
  questions: any = [];
  interests: any = [];
  userName: string = "";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public app: App,
              private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    this.userName = this.firebaseService.getCurrentUserName();
    if(this.firebaseService.isSignedIn()) {
      this.getQuestions();
    }
    else {
      this.navCtrl.setRoot(LoginPage);
      this.app.getRootNav().setRoot(LoginPage);
    }
  }

  getQuestions() {
    this.firebaseService.getUserInterests().then(res => {
      if (res != null)
        this.interests = res;
    });
    this.firebaseService.getFeedQuestions().then(res => {
      if(res != null)
        this.questions = res;
      this.isLoaded = true;
    });
  }

  redirect(qid) {
    this.navCtrl.push(QuestionPage,{
      qid: qid,
    });
  }

  goToProfile() {
    this.navCtrl.setRoot(TabsPage);
    this.app.getRootNav().setRoot(TabsPage);
  }

  ask() {
    this.navCtrl.push(AskPage);
  }
}
