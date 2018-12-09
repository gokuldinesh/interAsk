import { Component } from '@angular/core';

import { ProfilePage } from '../profile/profile';
import { AskedPage } from '../asked/asked';
import { ReceivedPage } from '../received/received';
import { FeedPage } from '../feed/feed';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ProfilePage;
  tab2Root = AskedPage;
  tab3Root = ReceivedPage;
  tab4Root = FeedPage;

  constructor() {

  }
}
