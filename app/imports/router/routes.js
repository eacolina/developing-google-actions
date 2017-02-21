Router.route('/', function() {
    // render the Home template with a custom data context
    this.render('main');
});

// when you navigate to "/one" automatically render the template named "One".
Router.route('/detail1');

// when you navigate to "/two" automatically render the template named "Two".
Router.route('/detail2');
