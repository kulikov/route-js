# Route — роутинг/диспатчинг хеш-урлов #
Примеры используемых схем
    #/my-objects-list 
    #/data/:id        // сработает для #/data/12 или #/data/test
    #/data(/:id)(/:name)      // id и name не обязательные параметры. сработает и для #/data/12/Dima и для #/data/12 и для #/data 
    #/data/*          // любое количество key/value/key2/value2/key3/value3 параметров 


## Стартуем перехват изменений хеша в урле ##

Добавляем Route.listen(); в onready секцию.

    $(document).ready(function() {
        Route.listen();
    });
    
После этого каждый раз когда будет меняться location.hash будет происходить сопоставление с имеющимеся схемами
и выполняться соответствующие экшены. Если ни одина схема не подойдет выполнится Route.resetAction
   
    
## Если ввели неверный или пустой  урл — выполняем эту функцию ##

    Route.resetAction(function() {
        console.log('rescue');
    });
   
    
## Мапим схемы урлов на экшены ##

Самый простой пример:

    Route.map('#/my-home-page').to(function() {
        console.log('Показываем что-нибудь');
    });
    
    
Поддерживаются пользовательские переменные
    
    Route.map('#/info/:dgCode/:tourId').to(function() {
        console.log(this._getParam('dgCode'));
        console.log(this._getParam('tourId'));
    });
    
    
Параметры могут быть необязательными

    Route.map('#/info/:dgCode(/:tourId)').to(function() {
        console.log(this._getParam('dgCode'));
    });

    
* вконце схемы раскрывается в любое количество key/value/key2/value2 параметров

    Route.map('#/params/*').to(function() {
        console.log(this._getParam('dgCode'));
    });
    
при заходе по урлу #/params/code/213/id/45/name/Dima
мы получим доступ ко всем этим параметрам this._getParam('code'), this._getParam('id'), this._getParam('name')

Можно делать так:

    Route.map('#/params/*')
        .before(function() { 
            // выполниться перед методом .to 
        })
        .to(function() {
            // сам экшн тут
        })
        .after(function() { 
            // выполниться в момент перехода с этого урала на другой 
        });