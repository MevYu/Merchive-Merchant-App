// Taro app config — page registration. Order matters: the first entry
// is the default landing page when no other route is requested. We
// land on dashboard because the bootstrap in app.tsx redirects to
// /pages/login/index when auth fails — keeping dashboard first means
// authenticated launches hit the right page without an extra hop.
export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/login/index',
    'pages/customers/index',
    'pages/customers/detail',
    'pages/orders/new',
    'pages/orders/list',
    'pages/recommend/index',
    'pages/handover/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0F1728',
    navigationBarTitleText: 'Merchive 商家',
    navigationBarTextStyle: 'white',
  },
});
