import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import { FirebaseService } from '../../services/firebase.service';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-question',
  templateUrl: 'question.html',
})
export class QuestionPage {

  answer = {
    content: ""
  }
  qid: any;
  question: any;
  answers: any = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public app: App,
              private firebaseService: FirebaseService) {
  }

  ngOnInit() {
    if (this.firebaseService.isSignedIn()) {
      this.qid = this.navParams.get('qid');
      this.getQuestion();
    }
    else {
      this.navCtrl.setRoot(LoginPage);
      this.app.getRootNav().setRoot(LoginPage);
    }
  }

  getQuestion() {
    this.answers = [];
    this.firebaseService.getQuestion(this.qid).then(res => {
      this.question = res;
      for (let i in this.question.answers) {
        this.answers.push(this.question.answers[i]);
      }
    });
  }

  sendResponse() {
    if (this.answer.content != "") {
      let timestamp = new Date().toISOString();
      timestamp = timestamp.replace(/[^0-9]/g, "");
      this.firebaseService.sendResponse(this.qid, timestamp, this.answer.content).then(res => {
        this.getQuestion();
      });
      this.answer.content = "";
    }
  }
}
