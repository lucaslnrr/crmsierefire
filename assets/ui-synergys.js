/* Minimal helper for sidebar and rippley button focus */
(function(){
  const toggle = document.querySelector('[data-sidebar-toggle], #sidebar-toggle, .js-sidebar-toggle');
  if(toggle){
    toggle.addEventListener('click', function(ev){
      ev.preventDefault();
      document.body.classList.toggle('sidebar-open');
    });
  }
})();