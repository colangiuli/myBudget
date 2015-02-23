angular.module("app", ["ngRoute"]).config(["$routeProvider", function($routeProvider) {
            var routes, setRoutes;
            return routes = ["dashboard", "ui/typography", "ui/buttons", "ui/icons", "ui/grids", "ui/widgets", "ui/components", "ui/timeline", "ui/nested-lists", "ui/pricing-tables", "ui/maps", "tables/static", "tables/dynamic", "tables/responsive", "forms/elements", "forms/layouts", "forms/validation", "forms/wizard", "charts/charts", "charts/flot", "charts/morris", "pages/404", "pages/500", "pages/blank", "pages/forgot-password", "pages/invoice", "pages/lock-screen", "pages/profile", "pages/signin", "pages/signup", "mail/compose", "mail/inbox", "mail/single", "tasks/tasks"], setRoutes = function(route) {
                var config, url;
                return url = "/" + route, config = {
                    templateUrl: "views/" + route + ".html"
                }, $routeProvider.when(url, config), $routeProvider
            }, routes.forEach(function(route) {
                return setRoutes(route)
            }), $routeProvider.when("/", {
                redirectTo: "/dashboard"
            }).when("/404", {
                templateUrl: "views/pages/404.html"
            }).otherwise({
                redirectTo: "/404"
            })
        }])