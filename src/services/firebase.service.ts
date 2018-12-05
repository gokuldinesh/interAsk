import { Injectable, Component } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { ToastController } from 'ionic-angular';

@Injectable()
@Component({
  selector: 'service-firebase',
  template: ''
})
export class FirebaseService {

  private user: any;
  private db: DatabaseReference;

  constructor(public toastCtrl: ToastController,
              private afAuth: AngularFireAuth) {
    this.db = firebase.database().ref();
  }

  getCurrentUserId() {
    if (this.user != null)
      return this.user.uid;
    else if (localStorage.getItem('user') != null) {
      this.user = JSON.parse(localStorage.getItem('user'));
      return this.user.uid;
    }
  }

  getCurrentUserName() {
    if (this.user != null)
      return this.user.displayName;
    else if (localStorage.getItem('user') != null) {
      this.user = JSON.parse(localStorage.getItem('user'));
      return this.user.uid;
    }
  }

  async signInWithGoogle(): Promise<any> {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    if (!(<any>window).cordova)
      return this.afAuth.auth.signInWithPopup(provider).then(res => {
        this.saveAuth(res);
      });
    else {
      return this.afAuth.auth.signInWithRedirect(provider).then(() => {
        return firebase.auth().getRedirectResult().then( res => {
          this.saveAuth(res);
        });
      });
    }
  }

  saveAuth(res) {
    this.user = res.user.toJSON();
    let tokens = res.credential;
    if(res.additionalUserInfo.isNewUser) {
      this.db.child('users').child(this.user.uid).child('name').set(this.user.displayName);
    }
    localStorage.setItem('user', JSON.stringify(this.user));
    localStorage.setItem('tokens', tokens);
  }

  isSignedIn() {
    if(this.user == null) {
      if (localStorage.getItem('user') != null) {
        this.user = JSON.parse(localStorage.getItem('user'));
        return true;
      }
      return false;
    }
    else
      return true;
  }

  signOut() {
    this.afAuth.auth.signOut().then((res) => {
      let message = 'You are signed out';
      this.presentToast(message);
    });
  }

  async getUserTags(): Promise<void> {
    this.db.child("users").child(this.user.uid)
    .child("tags").once("value").then((snapshot)=>{
      return snapshot.val();
    });    
  }

  getTags() {
    let tags = [ this.tech, this.lm, this.tech_disp, this.lm_disp ];
    return tags;
  }

  async updateProfile(initialTags, finalTags) {
    for (var i in finalTags)
    {
      if (initialTags == null)
      {
        this.db.child("tag_user").child(finalTags[i]).child(this.user.uid).set(true);
      }
      else if (!(initialTags.includes(finalTags[i])))
      {
        this.db.child("tag_user").child(finalTags[i]).child(this.user.uid).set(true);
      }
    }

    for (var i in initialTags)
    {
      if (finalTags == null)
      {
        this.db.child("tag_user").child(initialTags[i]).child(this.user.uid).set(null);
      }
      else if (!(finalTags.includes(initialTags[i])))
      {
        this.db.child("tag_user").child(initialTags[i]).child(this.user.uid).set(null);
      }
    }

    this.db.child("users").child(this.user.uid).child("tags").set(finalTags);
    let message = 'Tags updated successfully';
    this.presentToast(message);
  }

  async postQuery(timestamp, query, tags): Promise<void> {
    let question = {
      id: timestamp,
      tags: tags,
      question: query.question,
      explanation: query.explanation,
      last_timestamp: timestamp,
      flag_answered: 'false',
      asked_by: {
        user: this.user.uid,
        name: this.user.displayName,
        timestamp: timestamp
      }
    }
    this.db.child("questions").child(timestamp).set(question).then( res => {
      this.db.child("users").child(this.user.uid).child("asked").push(timestamp);
    }).catch( error => {
      console.log(error);
      let message = 'Unable to post query. Check your internet connection and try again.';
      this.presentToast(message);
    });

    this.pushQuery(timestamp, tags);
  }

  async pushQuery(timestamp, tags): Promise<void> {
    let send_to = [];
    let c = 0;
    for (let i in tags) {
      this.db.child("tag_user").child(tags[i]).once("value").then((snapshot)=>{
        let temp = snapshot.val();
        for (let j in temp) {
          if (j != this.afAuth.auth.currentUser.uid)
          send_to.push(j);
        }
        send_to = send_to.filter((el, i, a) => i === a.indexOf(el));
        c++;
        if (c == tags.length) {
          for (let i in send_to) {
            this.db.child("users").child(send_to[i]).child("received").push(timestamp);
          }
        }
      });
    }
    let message = 'Query posted successfully';
    this.presentToast(message);
  }

  async getAskedQuestions() {
    let questions = [];
    return this.db.child("users").child(this.user.uid).child("asked").once("value").then((snapshot)=>{
      let asked = snapshot.val();
      for (let i in asked)
      {
        this.db.child("questions").child(asked[i.toString()]).once("value").then((snapshot)=>{
          questions.push(snapshot.val());
        });
      }
    }).then(() => {
      return questions;
    });
  }

  async getReceivedQuestions() {
    let questions = [];
    return this.db.child("users").child(this.user.uid).child("received").once("value").then((snapshot)=>{
      let received = snapshot.val();
      for (let i in received)
      {
        this.db.child("questions").child(received[i.toString()]).once("value").then((snapshot)=>{
          questions.push(snapshot.val());
        });
      }
    }).then(() => {
      return questions;
    });
  }

  async getQuestion(qid) {
    let responses = [];
    return this.db.child("questions").child(qid).once("value").then((snapshot) => {
      return snapshot.val();
    }).catch(error => {
      console.log(error);
      this.presentToast(error.message);
    })
  }

  async sendResponse(qid, timestamp, answer): Promise<void> {
    let response = {
      timestamp: timestamp,
      user: this.user.uid,
      name: this.user.displayName,
      answer: answer
    }
    this.db.child("questions").child(qid).child("answers").child(timestamp).set(response);
  }


  presentToast(message: string) {
    const toast = this.toastCtrl.create({
        message: message,
        duration: 2000,
        position: 'bottom'
    });
    toast.present();
  }

  tech = [
    {id:"5", name: ".NET"},
    {id:"6", name: "Angular"},
    {id:"7", name: "Couchbase"},
    {id:"8", name: "SQL Server"},
    {id:"9", name: "Elastic Search"},
    {id:"10", name: "Docker"},
    {id:"11", name: "RabbitMQ"},
  ];
  lm = [
    {id:"1_a", name: "Order Management"},
    {id:"1_b", name: "Route Management"},
    {id:"1_c", name: "Account Management"},
    {id:"1_d", name: "Claims Management"},
    {id:"1_e", name: "Zone Management"},
    {id:"1_f", name: "Location Management"},
    {id:"1_g", name: "User Management"},
    {id:"1_h", name: "Facility Management"}    
  ]; 
  tech_disp = [
    {id:"5", name: ".NET"},
    {id:"6", name: "Angular"},
    {id:"7", name: "Couchbase"},
    {id:"8", name: "SQL Server"},
    {id:"9", name: "Elastic Search"},
    {id:"10", name: "Docker"},
    {id:"11", name: "RabbitMQ"},
  ];
  lm_disp = [
    {id:"1_a", name: "Order Management"},
    {id:"1_b", name: "Route Management"},
    {id:"1_c", name: "Account Management"},
    {id:"1_d", name: "Claims Management"},
    {id:"1_e", name: "Zone Management"},
    {id:"1_f", name: "Location Management"},
    {id:"1_g", name: "User Management"},
    {id:"1_h", name: "Facility Management"}
  ];

}