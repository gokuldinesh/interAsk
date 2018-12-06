import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { FirebaseService } from '../../services/firebase.service';
import { AskPage } from '../ask/ask';
import { QuestionPage } from '../question/question';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-received',
  templateUrl: 'received.html',
})
export class ReceivedPage {

  questions: any = [];
  isLoaded: boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public app: App,
              private firebaseService: FirebaseService) {}

  ngOnInit() {
    if(!this.firebaseService.isSignedIn()) {
      this.navCtrl.setRoot(LoginPage);
      this.app.getRootNav().setRoot(LoginPage);
    }
  }

  ionViewWillEnter() {
    this.isLoaded = false;
    this.getQuestions();
  }

  getQuestions() {
    this.firebaseService.getReceivedQuestions().then(res => {
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
  
  ask() {
    this.navCtrl.push(AskPage);
  }
}
