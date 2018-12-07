import { Injectable, Component } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { ToastController } from 'ionic-angular';
import { constants } from '../assets/constants';

@Injectable()
@Component({
  selector: 'service-firebase',
  template: ''
})
export class FirebaseService {

  private user: any;
  private db: DatabaseReference;
  private userTags: any;

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
      let message = constants.SIGNED_OUT;
      this.presentToast(message);
    });
  }

  async getUserTags() {
    return this.db.child("users").child(this.user.uid)
    .child("tags").once("value").then((snapshot)=>{
      return snapshot.val();
    });    
  }

  getTags() {
    let tags = constants.TAGS;
    return tags;
  }

  async updateProfile(initialTags, finalTags) {
    this.db.child("users").child(this.user.uid).child("tags").set(finalTags);
    this.updateUserTags(finalTags, initialTags, "true");
    this.updateUserTags(initialTags, finalTags, "null");
    let message = constants.UPDATED_TAGS;
    this.presentToast(message);
  }

  updateUserTags(tagArray1, tagArray2, val) {
    for (let tag1 in tagArray1) {
      if (tagArray2 == null) {
        this.updateUserTagsUtil(tagArray1[tag1], val);
      }
      else {
        let flag = true;
        for (let tag2 in tagArray2) {
          if (tagArray2[tag2] == tagArray1[tag1]) {
            flag = false;
            break;
          }
        }
        if (flag) {
          this.updateUserTagsUtil(tagArray1[tag1], val);
        }
      }
    }
  }

  updateUserTagsUtil(tag, val) {
    if (val == "true")
      this.db.child("tag_user").child(tag).child(this.user.uid).set(true);
    else if (val == "null")
      this.db.child("tag_user").child(tag).child(this.user.uid).set(null);
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
      let message = constants.POST_QUERY_ERROR;
      this.presentToast(message);
    });

    this.pushQuery(timestamp, tags);
  }

  async pushQuery(timestamp, tags): Promise<void> {
    let send_to = [];
    let c = 0;
    for (let tag in tags) {
      this.db.child("tag_user").child(tags[tag]).once("value").then((snapshot)=>{
        let userTemp = snapshot.val();
        for (let user in userTemp) {
          if (user != this.afAuth.auth.currentUser.uid)
          send_to.push(user);
        }
        send_to = send_to.filter((el, i, a) => i === a.indexOf(el));
        c++;
        if (c == tags.length) {
          for (let user in send_to) {
            this.db.child("users").child(send_to[user]).child("received").push(timestamp);
          }
        }
      });
    }
    let message = constants.POSTED_QUERY;
    this.presentToast(message);
  }

  async getAskedQuestions() {
    let questions = [];
    return this.db.child("users").child(this.user.uid).child("asked").once("value").then((snapshot)=>{
      let asked = snapshot.val();
      for (let qid in asked)
      {
        this.db.child("questions").child(asked[qid.toString()]).once("value").then((snapshot)=>{
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
      for (let qid in received)
      {
        this.db.child("questions").child(received[qid.toString()]).once("value").then((snapshot)=>{
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

}