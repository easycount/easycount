// JSON que incluye las claves de twitter y el resto de redes sociales de la aplicación
//NO EXPONER DE FORMA PÚBLICA (github, etc). Podría comprometer la seguridad de la aplicación

var config = {
    twitter: {
        key: '1wIWoNIRNyhrDXeaUAkMIH5bu',
        secret: 'V4tflPqVOVewPRzM0HNfKHOiOVsJJHc5kPWXGIZx2GChCPf24e'
    },
    google:{
        key: '199636947414-r8sfrnjsescah8v1s9sl3oj78bfc5afi.apps.googleusercontent.com',
        secret: 'kemVyz4tjGl1yDlhfkV4rLIJ',
    },
    session: {
        secret: 'easyKey'
    },
    gmail:{
        user: 'easycountofficial@gmail.com',
        pass: 'gilipollas69'
    },
    direccion: {
        host: 'localhost',
        //host: 'easycount-es.herokuapp.com',
        port: 3000
    },
    admin:{
        cookie: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiUHJ1ZWJhIHJvbGVzIiwic2NvcGVzIjpbInNpbXBsZSIsImJ1c2luZXNzIiwiYWRtaW4iXSwiaWF0IjoxNDYxMDc1NDYwLCJleHAiOjE0NjExNjE4NjB9.uEZDdES3jtxVO4nH567HIq52TEc6KmDwxRgZdi4IVtk"
    },
    restricciones:{
        frutos: ['en:nuts',
            'en:peanuts',
            'en:tree-nuts',
            'es:frutos-secos',
            'de:nusse',
            'es:otros-frutos-de-cascara',
            'de:haselnuss',
            'de:mandel',
            'pt:amendoim',
            'fr:autres-noix',
            'fr:fruits-secs',
            'es:frutos-secos-de-cascara',
            'fr:autres-fruits-secs-a-coque',
            'en:tree-nut',
            'pt:avela',
            'es:otros-frutos-secos',
            'en:other-nuts'],
        vegano: [
            'en:eggs',
            'en:fish',
            'en:crustaceans',
            'en:molluscs',
            'fr:arete',
            'fr:aretes',
            'de:fisch',
            'en:crustacea',
            'de:lupine',
            'en:crustacean-shellfish'
        ],
        celiaco: [
            'en:gluten',
            'fr:cereales-contenant-du-gluten',
            'en:gluten-cereals',
            'es:cereales-con-gluten'
        ],
        lactosa: [
            'en:milk',
            'fr:lait-de-chevre',
            'fr:proteines-de-lait',
            'fr:lait-de-vache',
            'fr:lait-de-brebis',
            'es:lacteos',
            'es:derivados-lacteos',
            'fr:derives-du-lait',
            'fr:derives-laitiers',
            'de:milcherzeugnisse',
            'fr:lait-d-amande',
            'es:productos-lacteos',
            'fr:lait-et-derives'
        ],
        diabetico: [
            'fr:sucres',
            'fr:sucres-naturellement-presents',
            'fr:glucides',
            'en:sugar'
        ]
    }
};

module.exports = config;