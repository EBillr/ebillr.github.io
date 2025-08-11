/* assets/js/session.js */
(function(){
  window.eb_getSession = function(){
    const s = localStorage.getItem('eb_session');
    if (!s) return null;
    try {
      const obj = JSON.parse(s);
      // expire in 7 days
      if (Date.now() - obj.createdAt > 7*24*60*60*1000){
        localStorage.removeItem('eb_session');
        return null;
      }
      return obj;
    } catch(e){
      localStorage.removeItem('eb_session');
      return null;
    }
  };

  window.eb_setSession = function(sessionObj){
    sessionObj.createdAt = Date.now();
    localStorage.setItem('eb_session', JSON.stringify(sessionObj));
  };

  window.eb_destroySession = function(){
    localStorage.removeItem('eb_session');
  };
})();
