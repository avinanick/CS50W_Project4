document.addEventListener('DOMContentLoaded', function() {

    // Here we should determine what page we are on, and load accordingly
    if (document.getElementById('all_posts')) {
        // set the listeners for the all posts section
        get_page_posts("all", 1);
    }
    if(document.getElementById('subscription_posts')) {
        get_page_posts("subscription", 1);
    }
    
  });

function create_posting_element(posting_json) {

    // The postong json should have: the poster name, the content, the number of
    // likes, if the current user has liked the post or not, the timestamp, and
    // whether or not the user owns this post
    let display_container = document.createElement('div');
    let poster_label = document.createElement('h4');
    let post_content = document.createElement('p');
    let post_timestamp = document.createElement('p');
    let like_count = document.createElement('p');

    display_container.setAttribute('class', post_display);

    poster_label.innerHTML = posting_json["poster"];
    post_content.innerHTML = posting_json["content"];
    post_timestamp.innerHTML = posting_json["timestamp"];
    like_count.innerHTML = posting_json["likes_count"];

}

function get_num_post_pages(user_set) {

}

function get_page_posts(user_set, page_number) {

}