import { Component, type PropsWithChildren } from 'react';
import Taro from '@tarojs/taro';
import { useSession } from '@/store/session';
import { getMeApi, hasMerchantRole } from '@/services/auth';
import { hasAuth, UnauthorizedError } from '@/services/http';
// Side-effect import: registers i18next + loads resources so the first
// page sees translated strings without a flash of keys.
import '@/i18n';
// Theme tokens (short --primary/--text ... vars) from the central
// @merchive/design-tokens package — single source of truth. Before app.scss.
import '@merchive/design-tokens/web';
import './app.scss';

// App is the Taro root. Three responsibilities at boot:
//
//   1. hydrate session store (zustand load happens on import)
//   2. if no token → reLaunch to /pages/login/index
//   3. if token present → /auth/me; reject when roles lack a merchant
//      role (consumer-only accounts must not see this app)
//
// We use reLaunch (not redirectTo) for the bounce so the back stack is
// empty — a user who lands on login by being rejected shouldn't be able
// to swipe back into the protected dashboard.
export default class App extends Component<PropsWithChildren> {
  componentDidMount() {
    // touch session store so its load() runs and channel is set.
    useSession.getState();
    this.bootstrapIdentity();
  }

  private async bootstrapIdentity() {
    if (!hasAuth()) {
      this.gotoLogin();
      return;
    }
    try {
      const me = await getMeApi();
      if (!hasMerchantRole(me.roles)) {
        // Not a merchant-side account — clear identity and bounce. The
        // login page reads this state to surface the "wrong account"
        // toast on landing.
        useSession.getState().logout();
        Taro.showToast({ title: '请用商家账号登录', icon: 'none', duration: 2000 }).catch(
          () => undefined,
        );
        this.gotoLogin();
        return;
      }
      useSession.getState().setIdentity(me);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        this.gotoLogin();
        return;
      }
      // network / 5xx — leave any cached identity in place and let the
      // page render in degraded mode. Don't bounce on transient errors.
    }
  }

  private gotoLogin() {
    Taro.reLaunch({ url: '/pages/login/index' }).catch(() => undefined);
  }

  render() {
    return this.props.children;
  }
}
