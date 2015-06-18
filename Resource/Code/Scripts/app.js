'use strict';

var appModule = angular.module('app', [
    'ui.router',
    'ngSanitize',
    'app.filters',
    'app.directives',
    'app.auth.services',
    'app.custom.directives',
    'app.assist.services',
    'app.common.services',
    'app.home.controllers',
    'app.user.controllers',
    'app.content.controllers',
    'app.resource.controllers',
    'app.ken.controllers',
    'app.exercise.controllers',
    'angularFileUpload'
]);

appModule.config(['$stateProvider', '$locationProvider', '$urlRouterProvider', function ($stateProvider, $locationProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/#/content/resource');

    $stateProvider
        //index 
        .state('home', { url: '/', templateUrl: window.appPatch + '/views/index', controller: 'HomeCtrl' })
        //登录
        .state('login', { url: '/login', layout: 'basic', templateUrl: window.appPatch + '/views/User/Login', controller: 'UserCtrl' })
        //内容区
        .state('content', { url: '/content', abstract: true, templateUrl: window.appPatch + '/views/Shared/Content', controller: 'ContentCtrl' })
        //我的资料
        .state('content.resource', { url: '/resource', templateUrl: window.appPatch + '/views/Resource/ResourceList', controller: 'ResourceCtrl' })

        //内容区
        .state('preview', { url: '/preview', templateUrl: window.appPatch + '/views/Exercise/Preview', controller: 'PreviewCtrl' })

        //习题列表
        .state('content.exercise', { url: '/exercise', templateUrl: window.appPatch + '/views/Exercise/ExerciseList', controller: 'ExerciseListCtrl' })

        //试题
        .state('exercise', { url: '/exercise/:ocid', abstract: true, templateUrl: window.appPatch + '/views/Shared/Exercise', controller: 'ExerciseCtrl' })
        //预览
        .state('content.preview', { url: '/content/exercise/preview', templateUrl: window.appPatch + '/views/Exercise/Preview', controller: 'PreviewCtrl' })
        //简答题
        .state('exercise.shortanswer', { url: '/shortanswer/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/ShortAnswer', controller: 'ShortAnswerCtrl' })
        //听力题
        .state('exercise.listening', { url: '/listening/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Listening', controller: 'ListeningCtrl' })
        //自定义题
        .state('exercise.custom', { url: '/custom/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Custom', controller: 'CustomCtrl' })
        //阅读理解题
        .state('exercise.reading', { url: '/reading/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Reading', controller: 'ReadingCtrl' })
        //问答题,写作题
        .state('exercise.quesanswer', { url: '/quesanswer/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/QuesAnswer', controller: 'QuesanswerCtrl' })
        //名词解释
        .state('exercise.noun', { url: '/noun/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Noun', controller: 'NounCtrl' })
        //判断题
        .state('exercise.truefalse', { url: '/truefalse/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/TrueFalse', controller: 'TruefalseCtrl' })
        //填空题
        .state('exercise.fillblank', { url: '/fileblank/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/FillBlank', controller: 'FillBlankCtrl' })
        //填空客观题
        .state('exercise.fillblank2', { url: '/fileblank2/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/FillBlank2', controller: 'FillBlank2Ctrl' })
        //连线题
        .state('exercise.connection', { url: '/connection/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Connection', controller: 'ConnectionCtrl' })
        //单选题
        .state('exercise.radio', { url: '/radio/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Radio', controller: 'RadioCtrl' })
        //多选题
        .state('exercise.multiple', { url: '/multiple/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Multiple', controller: 'MultipleCtrl' })
        //翻译题
        .state('exercise.translation', { url: '/translation/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Translation', controller: 'TranslationCtrl' })
        //排序题
        .state('exercise.sorting', { url: '/sorting/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Sorting', controller: 'SortingCtrl' })
        //分析题
        .state('exercise.analysis', { url: '/analysis/:ExerciseID', templateUrl: window.appPatch + '/views/Exercise/Analysis', controller: 'AnalysisCtrl' })

        //文件上传
        .state('fileupload', { url: '/fileupload', templateUrl: window.appPatch + '/views/CourseLive/Forum/topicadd', controller: 'ForumTopicCtrl' })

        //试卷
        .state('content.paper', { url: '/paper', templateUrl: window.appPatch + '/views/Paper/PaperList', controller: 'PaperListCtrl' })
        //新增智能试卷
        .state('content.newsmart', { url: '/paper', templateUrl: window.appPatch + '/views/Paper/PaperList', controller: 'PaperListCtrl' })
        //新增智能试卷
        .state('content.addsmart', { url: '/paper/smart', templateUrl: window.appPatch + '/views/Paper/AddSmart', controller: 'PaperSmartCtrl' })
        //新增自测型试卷
        .state('content.addtest', { url: '/paper/test', templateUrl: window.appPatch + '/views/Paper/AddTest', controller: 'PaperTestCtrl' })
        //新增答题卡试卷
        .state('content.addsheet', { url: '/paper/sheet', templateUrl: window.appPatch + '/views/Paper/AddSheet', controller: 'PaperSheetCtrl' })



        //知识点 
        .state('content.ken', { url: '/ken', templateUrl: window.appPatch + '/views/Ken/Ken', controller: 'KenCtrl' })
        //知识点 按章节
        .state('content.ken.chapter', { url: '/chapter/:ocid', templateUrl: window.appPatch + '/views/Ken/KenChapter', controller: 'KenChapterCtrl' })
        //知识点 按知识点
        .state('content.ken.topic', { url: '/topic/:ocid', templateUrl: window.appPatch + '/views/Ken/KenTopic', controller: 'KenTopicCtrl' })

        //.state('otherwise', {
        //    url: '*path',
        //    templateUrl: window.appPatch + '/views/Resource/ResourceList',
        //    controller: 'ResourceCtrl'
        //});

    $locationProvider.html5Mode(false);
}]);

appModule.run(['$templateCache', '$rootScope', '$state', '$stateParams', '$window', 'httpService', 'assistService', 'authService',
function ($templateCache, $rootScope, $state, $stateParams, $window, httpService, assistService, authService) {

    var view = angular.element('#ui-view');
    $templateCache.put(view.data('tmpl-url'), view.html());

    $rootScope.baseService = httpService;
    $rootScope.appTitle = 'IES';
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.authService = authService;
    $rootScope.basePath = window.appPatch;

    ///加载用户权限
    authService.LoadUserAuths();

    $rootScope.fromState = {};
    $rootScope.fromParams = {};

    assistService.init();

    $rootScope.enableWizard = true;
    $rootScope.enableSideLeft = true;

    $rootScope.switchModule = function (stateName) {
        $state.go(stateName, { ocid: -1 });
    }

    $rootScope.$on('onSetAppTitle', function (event, title) {
        $rootScope.appTitle = title;
    });

    $rootScope.$on('onWizardSwitch', function (event, enableWizard) {
        $rootScope.enableWizard = enableWizard;
    });

    $rootScope.$on('onSideLeftSwitch', function (event, enableSideLeft) {
        $rootScope.enableSideLeft = enableSideLeft;
    });


    $rootScope.httpService = httpService;

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $rootScope.fromState = fromState;
        $rootScope.fromParams = fromParams;
        $rootScope.layout = toState.layout;
    });

    $rootScope.$on('$locationChangeStart', function (event) {
    })
}]);