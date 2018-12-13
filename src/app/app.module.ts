import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import {GooglePlus} from '@ionic-native/google-plus';

import { TabsPage } from '../pages/tabs/tabs';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ProfilePage } from '../pages/profile/profile';
import { AskedPage } from '../pages/asked/asked';
import { ReceivedPage } from '../pages/received/received';
import { AskPage } from '../pages/ask/ask';
import { LoginPage } from '../pages/login/login';
import { QuestionPage } from '../pages/question/question';
import { FeedPage } from '../pages/feed/feed';
import { FirebaseService } from '../services/firebase.service';
import { config } from '../config';  

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    ProfilePage,
    AskedPage,
    ReceivedPage,
    AskPage,
    LoginPage,
    QuestionPage,
    FeedPage,
    FirebaseService
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    ProfilePage,
    AskedPage,
    ReceivedPage,
    AskPage,
    LoginPage,
    QuestionPage,
    FeedPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FirebaseService,
    AngularFireDatabase,
    GooglePlus
  ]
})
export class AppModule {}
