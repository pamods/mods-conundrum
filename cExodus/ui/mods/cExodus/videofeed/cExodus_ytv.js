/*
 * YouTube TV
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:
 * Version: 1.0.2
 */
/*jslint browser: true, undef:true, unused:true*/
/*global define2, module2, ender2 */
var prepareFunctions = Array();

(function(win, doc) {
    'use strict';
    var cExodus_ytv = cExodus_ytv || function(id, opts){

        var noop = function(){},
            settings = {
                element: null,
                user: null,
                fullscreen: false,
                accent: '#fff',
                controls: true,
                annotations: false,
                autoplay: false,
                chainVideos: true,
                browsePlaylists: false,
                wmode: 'opaque',
                events: {
                    videoReady: noop,
                    stateChange: noop
                }
            },

            cache = {},
            utils = {
                events: {
                    addEvent: function addEvent(element, eventName, func) {
                        if (element.addEventListener) {
                            return element.addEventListener(eventName, func, false);
                        } else if (element.attachEvent) {
                            return element.attachEvent("on" + eventName, func);
                        }
                    },
                    removeEvent: function addEvent(element, eventName, func) {
                        if (element.addEventListener) {
                            return element.removeEventListener(eventName, func, false);
                        } else if (element.attachEvent) {
                            return element.detachEvent("on" + eventName, func);
                        }
                    },
                    prevent: function(e) {
                        if (e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    }
                },
                addCSS: function(css){
                    var head = doc.getElementsByTagName('head')[0],
                        style = doc.createElement('style');
                        style.type = 'text/css';
                    if (style.styleSheet){
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(doc.createTextNode(css));
                    }
                    head.appendChild(style);
                },
                addCommas: function(str){
                    var x = str.split('.'),
                        x1 = x[0],
                        x2 = x.length > 1 ? '.' + x[1] : '',
                        rgx = /(\d+)(\d{3})/;
                    while (rgx.test(x1)) {
                        x1 = x1.replace(rgx, '$1' + ',' + '$2');
                    }
                    return x1 + x2;
                },
                parentUntil: function(el, attr) {
                    while (el.parentNode) {
                       if (el.getAttribute && el.getAttribute(attr)){
                            return el;
                        }
                        el = el.parentNode;
                    }
                    return null;
                },
                ajax: {
                    get: function(url, fn){
                        var handle;
                        if (win.XMLHttpRequest){
                            handle = new XMLHttpRequest();
                        } else {
                            handle = new ActiveXObject("Microsoft.XMLHTTP");
                        }
                        handle.onreadystatechange = function(){
                            if (handle.readyState === 4 && handle.status === 200){
                                fn.call(this, JSON.parse(handle.responseText));
                            }
                        };
                        handle.open("GET",url,true);
                        handle.send();
                    }
                },
                endpoints: {
                    base: 'http://gdata.youtube.com/',
                    userInfo: function(){
                        return utils.endpoints.base+'feeds/api/users/'+settings.user+'?v=2&alt=json';
                    },
                    userVids: function(){
                        return utils.endpoints.base+'feeds/api/users/'+settings.user+'/uploads/?v=2&alt=json&format=5&max-results=50';
                    },
                    userPlaylists: function(){
                        return utils.endpoints.base+'feeds/api/users/'+settings.user+'/playlists/?v=2&alt=json&format=5&max-results=50';
                    },
                    playlistVids: function(){
                        return utils.endpoints.base+'feeds/api/playlists/'+(settings.playlist)+'?v=2&alt=json&format=5&max-results=50';
                    }
                },
                deepExtend: function(destination, source) {
                    var property;
                    for (property in source) {
                        if (source[property] && source[property].constructor && source[property].constructor === Object) {
                            destination[property] = destination[property] || {};
                            utils.deepExtend(destination[property], source[property]);
                        } else {
                            destination[property] = source[property];
                        }
                    }
                    return destination;
                }
            },
            prepare = {
                youtube: function(fn){
                    var tag = doc.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    var firstScriptTag = doc.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    win.onYouTubeIframeAPIReady = fn;
                },
                build: function(){
                    //settings.element.className += " cExodus_ytv-canvas";
                    if(settings.fullscreen){
                        settings.element.className += " cExodus_ytv-full";
                    }
                    //utils.addCSS( '.cExodus_ytv-list .cExodus_ytv-active a{border-left-color: '+(settings.accent)+';}' );
                },
                playlists: function(res){
                    if(res && res.feed){
                        var list = '<div class="cExodus_ytv-playlists"><ul>',
                            playlists = res.feed.entry,
                            i;
                        for(i=0; i<playlists.length; i++){
                            var data = {
                                title: playlists[i].title.$t,
                                plid: playlists[i].yt$playlistId.$t,
                                thumb: playlists[i].media$group.media$thumbnail[1].url
                            };
                            list += '<a href="#" data-cExodus_ytv-playlist="'+(data.plid)+'">';
                                list += '<div class="cExodus_ytv-thumb"><div class="cExodus_ytv-thumb-stroke"></div><img src="'+(data.thumb)+'"></div>';
                                list += '<span>'+(data.title)+'</span>';
                            list += '</a>';
                        }
                        list += '</ul></div>';

                        var lh = doc.getElementsByClassName('cExodus_ytv-list-header')[0],
                            headerLink = lh.children[0];
                        headerLink.href="#";
                        headerLink.target="";
                        headerLink.setAttribute('data-cExodus_ytv-playlist-toggle', 'true');
                        doc.getElementsByClassName('cExodus_ytv-list-header')[0].innerHTML += list;
                        lh.className += ' cExodus_ytv-has-playlists';
                    }
                },
                compileList: function(data){
                    if(data && data.feed){
                        utils.ajax.get( utils.endpoints.userInfo(), function(userInfo){
                            var list = '',
                                user = {
                                    title: userInfo.entry.title.$t,
                                    url: 'http://youtube.com/user/'+userInfo.entry.yt$username.$t,
                                    thumb: userInfo.entry.media$thumbnail.url,
                                    summary: userInfo.entry.summary.$t,
                                    subscribers: userInfo.entry.yt$statistics.subscriberCount,
                                    views: userInfo.entry.yt$statistics.totalUploadViews
                                },
                                videos = data.feed.entry,
                                first = true,
                                i;
                            if(settings.playlist){
                                user.title += ' &middot; '+(data.feed.media$group.media$title.$t);
                            }
                            list += '<div class="cExodus_ytv-list-header">';
                                list += '<a href="'+(user.url)+'" target="_blank">';
                                    list += '<img src="'+(user.thumb)+'">';
                                    list += '<span>'+(user.title)+' <i class="cExodus_ytv-arrow down"></i></span>';
                                list += '</a>';
                            list += '</div>';

                            list += '<div class="cExodus_ytv-list-inner"><ul>';
                            for(i=0; i<videos.length; i++){
                                if(videos[i].media$group.yt$duration){
                                    var video = {
                                        title: videos[i].title.$t,
                                        slug: videos[i].media$group.yt$videoid.$t,
                                        link: videos[i].link[0].href,
                                        published: videos[i].published.$t,
                                        rating: videos[i].yt$rating,
                                        stats: videos[i].yt$statistics,
                                        duration: (videos[i].media$group.yt$duration.seconds),
                                        thumb: videos[i].media$group.media$thumbnail[1].url
                                    };

                                    var date = new Date(null);
                                    date.setSeconds(video.duration);
                                    var timeSlots = (date.toTimeString().substr(0, 8)).split(':'),
                                        time = timeSlots[1] + ':' + timeSlots[2];

                                    var isFirst = '';
                                    if(first===true){
                                        isFirst = ' class="cExodus_ytv-active"';
                                        first = video.slug;
                                    }

                                    list += '<li'+isFirst+'><a href="#" data-cExodus_ytv="'+(video.slug)+'" title="'+(video.title)+'" class="cExodus_ytv-clear">';
                                    list += '<div class="cExodus_ytv-thumb"><div class="cExodus_ytv-thumb-stroke"></div><span>'+(time)+'</span><img src="'+(video.thumb)+'"></div>';
                                    list += '<div class="cExodus_ytv-content">'+(video.title);
                                    if (video.stats)
                                    {
                                        list+'</b><span class="cExodus_ytv-views">'+utils.addCommas(video.stats.viewCount)+' Views</span>';
                                    }
                                    list += '</div></a></li>';
                                }
                            }
                            list += '</ul></div>';
//                            settings.element.innerHTML = '<div class="cExodus_ytv-relative"><div class="cExodus_ytv-video"><div id="cExodus_ytv-video-player"></div></div><div class="cExodus_ytv-list">'+list+'</div></div>';
                            settings.element.innerHTML = '<div class="cExodus_ytv-relative"><div class="cExodus_ytv-list">'+list+'</div></div>';

                            action.logic.loadVideo(first, settings.autoplay);

                            if(settings.browsePlaylists){
                                utils.ajax.get( utils.endpoints.userPlaylists(), prepare.playlists );
                            }

                        });
                    }
                }
            },
            action = {

                logic: {

                    playerStateChange: function(d){
                        console.log(d);
                    },

                    loadVideo: function(slug, autoplay){

                        /*
                        var house = doc.getElementsByClassName('cExodus_ytv-video')[0];
                        house.innerHTML = '<div id="cExodus_ytv-video-player"></div>';

                        cache.player = new YT.Player('cExodus_ytv-video-player', {
                            videoId: slug,
                            events: {
                                onReady: settings.events.videoReady,
                                onStateChange: function(e){
                                    if( (e.target.getPlayerState()===0) && settings.chainVideos ){
                                        var ns = doc.getElementsByClassName('cExodus_ytv-active')[0].nextSibling,
                                            link = ns.children[0];
                                        link.click();
                                    }
                                    settings.events.stateChange.call(this, e);
                                }
                            },
                            playerVars: {
                                enablejsapi: 1,
                                origin: doc.domain,
                                controls: settings.controls ? 1 : 0,
                                rel: 0,
                                showinfo: 0,
                                iv_load_policy: settings.annotations ? '' : 3,
                                autoplay: autoplay ? 1 : 0,
                                wmode: settings.wmode
                            }
                        });
                        */
                    }

                },

                endpoints: {
                    videoClick: function(e){
                        var target = utils.parentUntil(e.target ? e.target : e.srcElement, 'data-cExodus_ytv');

                        if(target){
                            if(target.getAttribute('data-cExodus_ytv')) {
                                                             console.log(target.getAttribute('title'));
                                startYoutubeVideoSequence(target.getAttribute('data-cExodus_ytv'),target.getAttribute('title'));
                            }
                        }

                        /*
                        if(target){

                            if(target.getAttribute('data-cExodus_ytv')){

                                // Load Video
                                utils.events.prevent(e);

                                var activeEls = doc.getElementsByClassName('cExodus_ytv-active'),
                                    i;
                                for(i=0; i<activeEls.length; i++){
                                    activeEls[i].className="";
                                }
                                target.parentNode.className="cExodus_ytv-active";
                                action.logic.loadVideo(target.getAttribute('data-cExodus_ytv'), true);

                            }

                        }
                        */
                    },
                    playlistToggle: function(e){
                        var target = utils.parentUntil(e.target ? e.target : e.srcElement, 'data-cExodus_ytv-playlist-toggle');

                        if(target && target.getAttribute('data-cExodus_ytv-playlist-toggle')){

                            // Toggle Playlist
                            utils.events.prevent(e);
                            var lh = doc.getElementsByClassName('cExodus_ytv-list-header')[0];
                            if(lh.className.indexOf('cExodus_ytv-playlist-open')===-1){
                                lh.className += ' cExodus_ytv-playlist-open';
                            } else {
                                lh.className = lh.className.replace(' cExodus_ytv-playlist-open', '');
                            }
                        }
                    },
                    playlistClick: function(e){
                        var target = utils.parentUntil(e.target ? e.target : e.srcElement, 'data-cExodus_ytv-playlist');

                        if(target && target.getAttribute('data-cExodus_ytv-playlist')){

                            // Load Playlist
                            utils.events.prevent(e);

                            settings.playlist = target.getAttribute('data-cExodus_ytv-playlist');
                            target.children[1].innerHTML = 'Loading...';

                            utils.ajax.get( utils.endpoints.playlistVids(), function(res){
                                var lh = doc.getElementsByClassName('cExodus_ytv-list-header')[0];
                                lh.className = lh.className.replace(' cExodus_ytv-playlist-open', '');
                                prepare.compileList(res);
                            });
                        }
                    }
                },
                loadAds: function(){
                    utils.ajax.get( utils.endpoints.adPlaylist(), function(data){
                        var videos = data.feed.entry,
                            i;
                        cache.ads = [];
                        for(i=0; i<videos.length; i++){
                            cache.ads.push({
                                title: videos[i].title.$t,
                                slug: videos[i].media$group.yt$videoid.$t,
                                duration: parseInt(videos[i].media$group.yt$duration.seconds, 10),
                            });
                        }
                    });
                },
                bindEvents: function(){

                    utils.events.addEvent( settings.element, 'click', action.endpoints.videoClick );
                    utils.events.addEvent( settings.element, 'click', action.endpoints.playlistToggle );
                    utils.events.addEvent( settings.element, 'click', action.endpoints.playlistClick );

                }
            },

            initialize = function(id, opts){
                utils.deepExtend(settings, opts);
                settings.element = (typeof id==='string') ? doc.getElementById(id) : id;

                if(settings.element && settings.user){

					// YTV was trying to use a global variable to store the callback so it didn't work when I added a second feed
					prepareFunctions.push((function() {
						prepare.build();
						action.bindEvents();
				        utils.ajax.get( settings.playlist ? utils.endpoints.playlistVids() : utils.endpoints.userVids(), prepare.compileList );
					}));

                    prepare.youtube(function(){
						prepareFunctions.forEach(function(f) {
							f();
						});
                    });
                }
            };

            /*
             * Public
             */
            this.destroy = function(){
                utils.events.removeEvent( settings.element, 'click', action.endpoints.videoClick );
                utils.events.removeEvent( settings.element, 'click', action.endpoints.playlistToggle );
                utils.events.removeEvent( settings.element, 'click', action.endpoints.playlistClick );
                settings.element.className = '';
                settings.element.innerHTML = '';
            };
            this.fullscreen = {
                state: function(){
                    return (settings.element.className).indexOf('cExodus_ytv-full') !== -1;
                },
                enter: function(){
                    if( (settings.element.className).indexOf('cExodus_ytv-full') === -1 ){
                        settings.element.className += 'cExodus_ytv-full';
                    }
                },
                exit: function(){
                    if( (settings.element.className).indexOf('cExodus_ytv-full') !== -1 ){
                        settings.element.className = (settings.element.className).replace('cExodus_ytv-full', '');
                    }
                }
            };

        initialize(id, opts);
    };
    if ((typeof module !== 'undefined') && module.exports) {
        module.exports = cExodus_ytv;
    }
    if (typeof ender === 'undefined') {
        this.cExodus_ytv = cExodus_ytv;
    }
    if ((typeof define === "function") && define.amd) {
        define("cExodus_ytv", [], function() {
            return cExodus_ytv;
        });
    }
    if ((typeof jQuery !== 'undefined')) {
        jQuery.fn.extend({
            cExodus_ytv: function(options) {
                return this.each(function() {
                    new cExodus_ytv(this, options);
                });
            }
        });
    }
}).call(this, window, document);