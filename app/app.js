angular
    .module('app')
    .controller('test', function($scope){
        console.log('INIT test controller');
        $scope.naam='marien';

        console.log('current step', $scope.intro.getCurrentStep());
        console.log('options naam', $scope.options.name);



        $scope.intro.onbeforechange(function(){
            console.log('CHANGED!');
        });

        $scope.intro.onchange(function(){
            console.log('CHANGED!');
        });
    })
    .controller('mainController', function($scope, $timeout){

        //Instead of sub directives mhIntro also supports a array of steps. So it's compatible with intro.js
        $scope.introOptions = {
            /*
            steps: [
                {
                    element: '#marien',
                    intro: "First tooltip"
                },
                {
                    element: '#marien2',
                    intro: "Second tooltip",
                    position: 'right'
                }
            ]
            */
        };

        //mhIntro will link the his API to this variable
        $scope.introApi = {};

        //The intro API will be linked on the next digest, so we place it in a $timeout
        $timeout(function () {
            $scope.introApi.onchange(function(){
                console.log('mainController detect change');
            });
            //$scope.startIntro();
            console.log($scope.introApi);
            $scope.introApi.start(1);
            //$scope.introApi.hideOverlay();
        });

    });




