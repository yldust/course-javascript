let myMap;
let clusterer;
let storage = sessionStorage;
let coords = [];

//storage.feedbacks = '';

ymaps.ready(init);

function init() {
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 10,
        controls: ["zoomControl"]
    });

    myMap.behaviors.disable([
        'scrollZoom'
    ]);
    myMap.events.add('click', (e) => openPlaceMark(e.get('coords')));

    const balloonContentLayoutClass = getClusteredBalloonContentLayoutClass();
    clusterer = new ymaps.Clusterer({
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: "cluster#balloonCarousel",
        balloonItemContentLayout: balloonContentLayoutClass,
        balloonContentLayoutHeight: 250,
        balloonContentLayoutWidth: 370,
        balloonCloseButton: false,
    });

    myMap.geoObjects.add(clusterer);

    document.body.addEventListener('click', (e) => {
        documentClick(e);
    });

    showPlaceMarks();
}

function getBalloonContentLayoutClass() {
    let balloonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
        '<div class ="feedback">' +
        '<div class="feedback-title">' +
        '<div class="feedback-address"><span><i class="fas fa-map-marker-alt"></i></span>' +
        '{{properties.address}}<span class="title-cross"><i data-role="feedback-close" class="fa fa-times" aria-hidden="true"></i></span></div>' +
        '</div>' +
        '{% if properties.list.length > 0 %}' +
        '<div class="feedback-list">' +
        '{% for item in properties.list %}' +
        '<div class="feedback-item">' +
        '<div><span class="feedback-name">{{item.name}}</span> ' +
        '<span class="feedback-place">{{item.place}}</span></div>' +
        '<div class="feedback-text">{{item.text}}</div>' +
        '</div>' +
        '{% endfor %}' +
        '</div>' +
        '{% endif %}' +
        '<div class="form" data-role="feedback-form">' +
        '<input data-role="feedback-coords" type="hidden" value="{{properties.coords}}">' +
        '<h3 class="title">Отзыв:</h3>' +
        '<div class="field">' +
        '<input data-role="feedback-name" type="text" placeholder="Укажите ваше имя">' +
        '</div>' +
        '<div class="field">' +
        '<input data-role="feedback-place" type="text" placeholder="Укажите место">' +
        '</div>' +
        '<div class="field">' +
        '<textarea data-role="feedback-text" placeholder="Оставьте отзыв" rows="5"></textarea>' +
        '</div>' +
        '<div class="f_right">' +
        '<button data-role="feedback-add" class="button">Добавить</button>' +
        '</div>' +
        '</div></div>'
    );
    return balloonContentLayoutClass;
}

function getClusteredBalloonContentLayoutClass() {
    let balloonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
        '<div class="clustered">' +
        '<div class ="feedback">' +
        '<div class="feedback-title">' +
        '<div class="feedback-address click-address"><span><i class="fas fa-map-marker-alt"></i></span>' +
        '{{properties.address}}<span class="title-cross"><i data-role="feedback-close" class="fa fa-times" aria-hidden="true"></i></span></div>' +
        '</div>' +
        '{% if properties.list.length > 0 %}' +
        '<div class="feedback-list" data-role="feedback-list">' +
        '<div class="feedback-item">' +
        '<div><span class="feedback-name">{{properties.list[0].name}}</span> ' +
        '<span class="feedback-place">{{properties.list[0].place}}</span></div>' +
        '<div class="feedback-text">{{properties.list[0].text}}</div>' +
        '</div>' +
        '</div>' +
        '{% endif %}' +
        '<div class="form hide" data-role="feedback-form">' +
        '<input data-role="feedback-coords" type="hidden" value="{{properties.coords}}">' +
        '<h3 class="title">Отзыв:</h3>' +
        '<div class="field">' +
        '<input data-role="feedback-name" type="text" placeholder="Укажите ваше имя">' +
        '</div>' +
        '<div class="field">' +
        '<input data-role="feedback-place" type="text" placeholder="Укажите место">' +
        '</div>' +
        '<div class="field">' +
        '<textarea data-role="feedback-text" placeholder="Оставьте отзыв" rows="5"></textarea>' +
        '</div>' +
        '<div class="f_right">' +
        '<button data-role="feedback-add" class="button">Добавить</button>' +
        '</div>' +
        '</div></div></div>'
    );
    return balloonContentLayoutClass;

}

function showPlaceMarks() {
    let arr = (storage.feedbacks) ? JSON.parse(storage.feedbacks) : [];
    for (const item of arr) {
        createPlacemark(item.coords);
    }
}

function openPlaceMark(coords) {
    const balloonContentLayoutClass = getBalloonContentLayoutClass();
    ymaps.geocode(coords).then(function (res) {
        const firstGeoObject = res.geoObjects.get(0);
        const addr = firstGeoObject.getAddressLine();
        const listByCoords = getListByCoords(coords);
        strCoords = JSON.stringify(coords);
        myMap.balloon.open(coords, { properties: { coords: strCoords, address: addr, list: listByCoords } }, {
            contentLayout: balloonContentLayoutClass,
            closeButton: false,
        });
    });
}

function createPlacemark(coords) {
    const balloonContentLayoutClass = getBalloonContentLayoutClass();
    const placeLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="placemark"><i class="placemark fas fa-map-marker-alt"></i></div>', {
        build: function placeBind() {
            placeLayout.superclass.build.call(this);
            const circle = {
                type: 'Circle',
                coordinates: [-20, 0],
                radius: 30,
            };
            this.getData().options.set('shape', circle);
        }
    });

    strCoords = JSON.stringify(coords);
    const listByCoords = getListByCoords(coords);
    const addr = (listByCoords.length > 0) ? listByCoords[0].address : "";

    const placemark = new ymaps.Placemark(coords,
        { coords: strCoords, address: addr, list: listByCoords },
        {
            iconLayout: placeLayout,
        }
    );

    placemark.events.add('click', (e) => {
        const coords = e.get('target').geometry.getCoordinates();
        openPlaceMark(coords);
    });

    clusterer.add(placemark);
}

function documentClick(e) {
    if (e.target.dataset.role === 'feedback-add') {
        const feedbackCoords = document.querySelector('[data-role=feedback-coords]');
        const coords = JSON.parse(feedbackCoords.value);
        const feedbackName = document.querySelector('[data-role=feedback-name]'),
            feedbackPlace = document.querySelector('[data-role=feedback-place]'),
            feedbackText = document.querySelector('[data-role=feedback-text]');

        if (feedbackName && feedbackName.value !== 0 ||
            feedbackPlace && feedbackPlace.value !== 0 ||
            feedbackText && feedbackText.value !== 0) {
            ymaps.geocode(coords).then(function (res) {
                const firstGeoObject = res.geoObjects.get(0),
                    address = firstGeoObject.getAddressLine();
                const data = {
                    coords,
                    feedback: {
                        address,
                        name: feedbackName.value,
                        place: feedbackPlace.value,
                        text: feedbackText.value,
                    },
                };
                let arr = (storage.feedbacks) ? JSON.parse(storage.feedbacks) : [];
                arr.push(data);
                storage.feedbacks = JSON.stringify(arr);

                createPlacemark(coords);

                myMap.balloon.close();
            });
        }
    }

    if (e.target.dataset.role === 'feedback-close') {
        myMap.balloon.close();
    }

    if (e.target.classList.contains("click-address")) {
        const feedbackForm = document.querySelector('[data-role=feedback-form]');
        const feedbackList = document.querySelector('[data-role=feedback-list]');
        const feedbackCoords = document.querySelector('[data-role=feedback-coords]');
        const coords = JSON.parse(feedbackCoords.value);

        html = getHTMLItem(coords);
        feedbackList.innerHTML = html;
        if (feedbackForm.classList.contains("hide")) {
            feedbackForm.classList.remove("hide");
        } else {
            feedbackForm.classList.add("hide");
        }
    }
}

function getListByCoords(coords) {
    const arr = (storage.feedbacks) ? JSON.parse(storage.feedbacks) : [];
    let list = [];
    for (const item of arr) {
        if (item.coords[0] === coords[0] && item.coords[1] === coords[1]) {
            list.push(item.feedback);
        }
    }
    return list;
}

function getHTMLItem(coords) {
    const list = getListByCoords(coords);
    html = "";
    for (const item of list) {
        html += `<div class="feedback-item">
        <div><span class="feedback-name">${item.name}</span>
        <span class="feedback-place">${item.place}</span></div>
        <div class="feedback-text">${item.text}</div></div>`;
    }

    return html;
}