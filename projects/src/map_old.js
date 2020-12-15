let myMap;
let clusterer;
let storage = sessionStorage;
let coords = [];

storage.feedbacks = '';

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

    clusterer = new ymaps.Clusterer({
        groupByCoordinates: true,
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: false,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonContentLayoutWidth: 350,
        clusterBalloonContentLayoutHeight: 350,
    });

    myMap.geoObjects.add(clusterer);

    showPlaceMarks();

    myMap.events.add('click', function (e) {
        coords = e.get('coords');
        const MyballoonContentLayoutClass = getBalloonContentLayoutClass();

        myMap.balloon.open([coords[0], coords[1]], {}, {
            contentLayout: MyballoonContentLayoutClass,
            closeButton: true
        });
    });

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains("feedback-add")) {
            let objs = (storage.feedbacks) ? JSON.parse(storage.feedbacks) : [];
            let obj = {};
            const userName = document.querySelector('input[name="user-name"]'),
                userPlace = document.querySelector('input[name="user-place"]'),
                feedbackContent = document.querySelector('textarea[name="feedback-content"]'),
                latitude = document.querySelector('input[name="feedback-latitude"]'),
                longtitude = document.querySelector('input[name="feedback-longtitude"]');

            e.preventDefault();

            if (!userName || !userPlace || !feedbackContent) {
                myMap.balloon.close();
                return;
            }

            if (latitude && longtitude) {
                coords[0] = parseFloat(latitude.value);
                coords[1] = parseFloat(longtitude.value);
            }

            ymaps.geocode(coords).then(function (res) {
                const firstGeoObject = res.geoObjects.get(0);
                const address = firstGeoObject.getAddressLine();

                obj = {
                    latitude: coords[0],
                    longtitude: coords[1],
                    name: userName.value,
                    place: userPlace.value,
                    content: feedbackContent.value,
                    address: address
                };

                objs.push(obj);
                storage.feedbacks = JSON.stringify(objs);
                createPlacemark(coords);

                myMap.balloon.close();
            });
        }

        if (e.target.classList.contains("feedback-address")) {
            const feedbackForm = document.querySelector('.feedback-form');
            if (feedbackForm.classList.contains("hide")) {
                feedbackForm.classList.remove("hide");
            } else {
                feedbackForm.classList.add("hide");
            }
        }
    });
}

function getBalloonContentLayoutClass1() {
    let MyballoonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
        '<div class="feedback-block">' +
        '<div class="item">' +
        '<span class="feedback-name">{{ properties.balloonContentName }}</span> ' +
        '[<span class="feedback-place">{{ properties.balloonContentPlace }}</span>]' +
        '</div>' +
        '<div class="item"><span class="feedback-content">{{ properties.balloonContentText }}</span></div>' +
        '<div class="item"><span class="feedback-address">{{ properties.balloonContentAdress }}</span></div>' +
        '<input name="feedback-latitude" type="hidden" value="{{properties.balloonContentLatitude}}">' +
        '<input name="feedback-longtitude" type="hidden" value="{{properties.balloonContentLongtitude}}">' +
        '<div class="feedback-form hide">' +
        '<div class="title">Отзыв:</div>' +
        '<input name="user-name" placeholder="Укажите ваше имя" type="text"><br>' +
        '<input name="user-place" placeholder="Укажите место" type="text"><br>' +
        '<textarea name="feedback-content" placeholder="Оставьте отзыв"></textarea><br>' +
        '<button class ="feedback-add">Добавить</button>' +
        '</div>' +
        '</div>'
    );

    return MyballoonContentLayoutClass;
}

function getBalloonContentLayoutClass() {
    let MyballoonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
        '<div class="feedback-block">' +
        '{% if properties.balloonContentLatitude %}' +
        '<div class="item">' +
        '<span class="feedback-name">{{ properties.balloonContentName }}</span> ' +
        '[<span class="feedback-place">{{ properties.balloonContentPlace }}</span>]' +
        '</div>' +
        '<div class="item"><span class="feedback-content">{{ properties.balloonContentText }}</span></div>' +
        '<div class="item"><span class="feedback-address">{{ properties.balloonContentAdress }}</span></div>' +
        '<input name="feedback-latitude" type="hidden" value="{{properties.balloonContentLatitude}}">' +
        '<input name="feedback-longtitude" type="hidden" value="{{properties.balloonContentLongtitude}}">' +
        '{% endif %}' +
        '<div class="feedback-form">' +
        '<div class="title">Отзыв:</div>' +
        '<input name="user-name" placeholder="Укажите ваше имя" type="text"><br>' +
        '<input name="user-place" placeholder="Укажите место" type="text"><br>' +
        '<textarea name="feedback-content" placeholder="Оставьте отзыв"></textarea><br>' +
        '<button class ="feedback-add">Добавить</button>' +
        '</div>' +
        '</div>'
    );

    return MyballoonContentLayoutClass;
}

function createPlacemark(coords) {
    const placemark = new ymaps.Placemark(coords);
    placemark.events.add('click', (e) => {
        const coords = e.get('target').geometry.getCoordinates();
        openPlaceMark(coords);
    });
    clusterer.add(placemark);
}

function openPlaceMark(coords) {
    const MyballoonContentLayoutClass = getBalloonContentLayoutClass();
    let list = getFeedbackList(coords);

    myMap.balloon.open(coords, {}, {
        contentLayout: MyballoonContentLayoutClass,
        closeButton: true
    });
}

function getFeedbackList(coords) {

}

function showPlaceMarks() {
    const arrayFeedbackObjs = (storage.feedbacks) ? JSON.parse(storage.feedbacks) : [];
    let placemarks = [];
    if (arrayFeedbackObjs.length > 0) {
        for (obj of arrayFeedbackObjs) {
            const MyballoonContentLayoutClass = getBalloonContentLayoutClass([obj.latitude, obj.longtitude]);
            var placemark = new ymaps.Placemark(
                [obj.latitude, obj.longtitude],
                {
                    balloonContentName: obj.name,
                    balloonContentPlace: obj.place,
                    balloonContentText: obj.content,
                    balloonContentLatitude: obj.latitude,
                    balloonContentLongtitude: obj.longtitude,
                    balloonContentAdress: obj.address
                },
                {
                    balloonContentLayout: MyballoonContentLayoutClass,
                    balloonCloseButton: true
                }
            );
            clusterer.add(placemark);
        }
    }
}
