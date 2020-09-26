document.addEventListener('DOMContentLoaded', function() {

    // Here we should determine what page we are on, and load accordingly
    // May change this to getting a class, then checking its id in the if
    if (document.getElementById('all_posts')) {
        // set the listeners for the all posts section
        load_page_posts("all", 1);
        document.getElementById('new_post_form').addEventListener('submit', create_new_post);
    }
    if(document.getElementById('subscription_posts')) {
        load_page_posts("subscription", 1);
    }
    
  });

function create_new_post() {

    let post_content = document.getElementById('new_post_content').value;
    const csrftoken = getCookie('csrftoken');

    const request = new Request('/create/', {headers: {'X-CSRFToken': csrftoken}});
    fetch(request, {
        method: 'POST',
        body: JSON.stringify({
            content: post_content
        })
      })
      .then(response => {
          console.log(response);
          // Should I reload the pages? Do some animation?
      })

}

function create_posting_element(posting_json) {

    // The pistong json should have: the poster name, the content, the number of
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

    display_container.appendChild(poster_label);
    display_container.appendChild(post_content);
    display_container.appendChild(post_timestamp);
    display_container.appendChild(like_count);

    return display_container;

}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function get_num_post_pages(user_set) {

}

function load_page_posts(user_set, page_number) {

    fetch('/posts/' + user_set + '/' + page_number)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        // Get the posts list and add them all using create post element
        // Keep in mind the last element in the object is the number of pages
        const post_list = document.getElementsByClassName('post_list');
        for(let i = 0; i < posts.length - 1; i++) {
            post_list.appendChild(create_posting_element(posts[i]));
        }
    })

}