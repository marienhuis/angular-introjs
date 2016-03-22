angular
    .module('app')
    .factory('confirmService', function(win) {
        var confirmations = {};

        var serviceApi = {
            setConfirm : setConfirm,
            getConfirmations: getConfirmations
        };
        return serviceApi;

        function setConfirm(key, value){
            confirmations[key] = value;
        }

        function setConfirmations(){

        }

        function getConfirmations(){
            return confirmations;
        }
    });