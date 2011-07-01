var Route = 
{
    map: function(path)
    {
        if (Route._routes.defined.hasOwnProperty(path)) {
            return Route._routes.defined[path];
        } else {
            return new Route._core.route(path);
        }
    },
    
    listen: function()
    {
        if (location.hash !== '') {
            Route._dispatch();
        }

        if ('onhashchange' in window) {
            window.onhashchange = Route._dispatch;
        } else {
            setInterval(Route._dispatch, 50);
        }
    },
    
    resetAction: function(fn)
    {
        Route._routes.resetAction = fn;
    },
    
    
    _match: function(path, parameterize) 
    {
        var params = {}, _possibleRoutes, slice, slicePaths, i, j, compare;

        for (var route in Route._routes.defined) {

            if (route === null || route === undefined) continue;

            route = Route._routes.defined[route];
            _possibleRoutes = route._partition();
            
            for (j = 0; j < _possibleRoutes.length; j++) {
                
                slice   = _possibleRoutes[j];
                compare = path;
                
                if (slice.search(/\*|:/) > 0) {
                    
                    slicePaths = slice.split('/');
                    for (i = 0; i < slicePaths.length; i++) {
                        
                        if ((i < compare.split('/').length) && (slicePaths[i][0] === ':')) {
                            params[slicePaths[i].replace(/:/, '')] = compare.split('/')[i];
                            compare = compare.replace(compare.split('/')[i], slicePaths[i]);
                        }
                        
                        if ((i + 1) == slicePaths.length && slicePaths[i] === '*' && compare.split('/').length >= i) {
                            var compPaths = compare.split('/').slice(i);
                            var n = 0;
                            while (true) {
                                if (compPaths[n] === undefined) break;
                                params[compPaths[n]] = compPaths[n+1];
                                n = n + 2;
                            }
                            compare = compare.split('/').slice(0, i).join('/') + '/*';
                        }
                    }
                }
                
                if (slice === compare) {
                    if (parameterize) {
                        route._params = params;
                    }
                    return route;
                }
            }
        }

        return null;
    },
    
    _dispatch: function() 
    {
        if (Route._routes.current !== location.hash) {
            
            Route._routes.previous = Route._routes.current;
            Route._routes.current  = location.hash;
            var _matchedRoute     = Route._match(location.hash, true);

            if (Route._routes.previous) {
                var _previousRoute = Route._match(Route._routes.previous);
                if (_previousRoute !== null && _previousRoute._afterAction !== null) {
                    _previousRoute._afterAction();
                }
            }

            if (_matchedRoute !== null) {
                _matchedRoute._run();
            } else {
                if (Route._routes.resetAction !== null) {
                    Route._routes.resetAction();
                }
            }
        }
    },
    
    _core: 
    {
        route: function(path) 
        {
            this._path    = path;
            this._action  = [];
            this._params  = {};
            
            this._getParam = function(name, defaultValue) {
                return typeof(this._params[name]) !== 'undefined' ? this._params[name] : defaultValue;
            };
            
            this._getAllParams = function() {
                return this._params;
            };
            
            this._beforeAction = [];
            this._afterAction  = null;
            Route._routes.defined[path] = this;
        }
    },
    
    _routes: {
        'current': null,
        'previous': null,
        'resetAction': null,
        'defined': {}
    }
};


Route._core.route.prototype = 
{
    to: function(fn) 
    {
        this._action.push(fn);
        return this;
    },
    
    before: function(fns)
    {
        if (fns instanceof Array) {
            this._beforeAction = this._beforeAction.concat(fns);
        } else {
            this._beforeAction.push(fns);
        }
        return this;
    },
    
    after: function(fn)
    {
        this._afterAction = fn;
        return this;
    },
    
    
    _partition: function()
    {
        var parts = [], options = [], re = /\(([^}]+?)\)/g, text, i;
        while (text = re.exec(this._path)) {
            parts.push(text[1]);
        }
        options.push(this._path.split('(')[0]);
        for (i = 0; i < parts.length; i++) {
            options.push(options[options.length - 1] + parts[i]);
        }
        return options;
    },
    
    _run: function() 
    {
        var _haltExecution = false, i, result, previous,
            _currRoute = Route._routes.defined[this._path];
        
        if (_currRoute.hasOwnProperty('_beforeAction')) {
            if (_currRoute._beforeAction.length > 0) {
                for (i = 0; i < _currRoute._beforeAction.length; i++) {
                    result = _currRoute._beforeAction[i]();
                    if (result === false) {
                        _haltExecution = true;
                        break;
                    }
                }
            }
        }
        
        if (!_haltExecution) {
            for (var n in _currRoute._action) {
                _currRoute._action[n].apply(_currRoute);
            }
        }
    }
};