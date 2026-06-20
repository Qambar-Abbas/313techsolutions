(function () {

  // Smooth scroll for .page-scroll links
  function initPageScroll() {
    var pageLinks = document.querySelectorAll('.page-scroll');
    pageLinks.forEach(function(elem) {
      elem.addEventListener('click', function(e) {
        var href = elem.getAttribute('href');
        if (!href) return;
        var hashIdx = href.indexOf('#');
        if (hashIdx === -1) return;
        var targetId = href.slice(hashIdx + 1);
        var target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initPageScroll);

})();
