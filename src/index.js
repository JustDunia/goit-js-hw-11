import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import '../node_modules/simplelightbox/dist/simple-lightbox.min.css';
import { throttle } from 'lodash';

const gallery = document.querySelector('.gallery');
const btnSearch = document.querySelector('.search');
const input = document.querySelector('input');

const AK = '34901628-5648d2abf5d6da9cdaab83e9c';
const baseURL = 'https://pixabay.com/api/?';
const imgType = 'photo';
const orient = 'horizontal';
const safeSearch = true;
const perPage = 40;

let page = 1;
let shownHits = 0;
let lightBox;

function createCollection(array) {
  const markup = array
    .map(item => {
      return `
      <a class="photo-card" href="${item.largeImageURL}">
      <div class="img-container">
        <img
          class="img"
          src="${item.webformatURL}"
          alt="${item.tags}"
          loading="lazy"
        />
      </div>
      <div class="info">
        <p class="info-item"><b>Likes</b><br />${item.likes}</p>
        <p class="info-item"><b>Views</b><br />${item.views}</p>
        <p class="info-item"><b>Comments</b><br />${item.comments}</p>
        <p class="info-item"><b>Downloads</b><br />${item.downloads}</p>
      </div>
    </a>
    `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  lightBox = new SimpleLightbox('.gallery a', {});
}

async function getData(url) {
  const response = await axios.get(url);
  const data = await response.data;
  return data;
}

function searchHandler(page) {
  const phrase = input.value.split(' ').join('+');
  const URL = `${baseURL}key=${AK}&image_type=${imgType}&orientation=${orient}&safesearch=${safeSearch}&per_page=${perPage}&page=${page}&q=${phrase}`;

  getData(URL).then(data => {
    shownHits += data.hits.length;

    if (shownHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      createCollection(data.hits);
    }

    if (shownHits === data.totalHits && shownHits !== 0) {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      window.removeEventListener('scroll', throttled);
    }

    if (page === 1 && shownHits !== 0) {
      Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
    }
  });
}

const throttled = throttle(
  () => {
    if (
      gallery.lastElementChild &&
      gallery.lastElementChild.getBoundingClientRect().y <
        window.innerHeight + 300
    ) {
      page++;
      searchHandler(page);
      lightBox.refresh();
    }
  },
  500,
  { trailing: true, leading: false }
);

btnSearch.addEventListener('click', e => {
  e.preventDefault();
  gallery.innerHTML = '';
  shownHits = 0;
  page = 1;
  searchHandler(page);
  window.addEventListener('scroll', throttled);
});
