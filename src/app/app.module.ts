import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AngularFireModule} from 'angularfire2';
import { AngularFireAuthModule} from 'angularfire2/auth';
import {GooglePlus} from '@ionic-native/google-plus';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';


import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage} from '../pages/login/login';

import { ProfilePage } from '../pages/profile/profile';
import { AskedPage } from '../pages/asked/asked';
import { ReceivedPage } from '../pages/received/received';
import { AskPage } from '../pages/ask/ask';
import { QuestionPage } from '../pages/question/question';
import { FirebaseService } from '../services/firebase.service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

const firebaseCinfig = {
  apiKey: "AIzaSyCL26ks_imNn122bro6aU7e_wkGI1aG58Y",
  authDomain: "queryhome-dd6fb.firebaseapp.com",
  databaseURL: "https://queryhome-dd6fb.firebaseio.com",
  projectId: "queryhome-dd6fb",
  storageBucket: "queryhome-dd6fb.appspot.com",
  messagingSenderId: "314946282716"
}

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    LoginPage,
    ProfilePage,
    AskedPage,
    ReceivedPage,
    AskPage,
    QuestionPage,
    FirebaseService
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseCinfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    LoginPage,
    ProfilePage,
    AskedPage,
    ReceivedPage,
    AskPage,
    QuestionPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GooglePlus,
    FirebaseService,
    AngularFireDatabase,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
