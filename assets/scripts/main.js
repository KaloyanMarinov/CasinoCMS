jQuery(document).ready(function($) {
	
	var header = '.header';
	var nav = '.js-nav';
	var navOpen = 'nav-menu--open';
	var navToggle = '.js-nav-toggle';
	var wrapper = '.js-wrapper';
	var menuItem = '.menu__item__link[href="#"]';
	var menuItemOpen = 'menu__item--open';
	var subMenu = '.js-sub-menu';
	var subMenuActive = '.sub-menu__active';
	var autoComplete = '.js-autocomplete';
	var gamesAutocomplete = [ "Fairy Gate", "Gonzo's Quest", "Fortunes of the Dead" ];
	var searchCollapse = '#search';
	var tableCardView = '[data-toggle="table-view"]';
	var tooltip = '[data-toggle="tooltip"]';
	var languageItem = '.language__item';
	var languageItemMobile = '.language__item--mobile';
	var collapseLanguage = '#language';
	var imagePreview = '.preview__zoom';
	var imagePreviewWidth = 0;
	var imagePreviewHeight = 0;
	var bonusType = '.js-bonus-type';
	var bonusSort = '.js-bonus-order';
	var select2 = '.js-select2';
	var cloneSelect2 = '.js-select2-clone';
	var addReward = '.js-add-reward';
	var cloneWrapper = '.js-clone-wrapper';
	var cloneReward = '.js-rewards-clone';
	var addRepeater = '.js-add-repeater-item';
	var removeReward = '.js-clone-rewards-remove';
	var cloneRepeaterWrapper = '.js-repeater-wrapper';
	var cloneRepeaterItem = '.js-repeater-item-clone';
	var cloneRepeaterRemove = '.js-repeater-remove';
	var containerMediaLibrary = '.media__library__container';
	var btnMediaLibrary = '.media__library__btn-attachment';
	var btnMediaLibrarySidebarClose = '.media__library__sidebar__close';
	var tableSortable = '.js-table-sortable';
	var WFItemsType = '.js-items-type';
	var rolesExpand = '.js-roles-expand';
	var rolesCollapse = '.js-roles-collapse';
	var rolesAllAccess = '.js-roles-all-access';
	var rolesItem = '.js-roles-item';
	var rolesItemDropdownChecked = [];
	var rolesSubItem = '.js-roles-sub-item';
	var rolesItemCheck = '.js-roles-item-check';
	var rolesSubItemCheck = '.js-roles-sub-item-check';
	var rolesDropdown = '.js-roles-dropdown';
	var rolesDropDownAllCkeck = '.js-roles-dropdown-all-check';
	var rolesDropdownCheck = '.js-roles-dropdown-check';
	var rolesDropdownLangCheck = 'js-roles-dropdown-lang-check';
	var rolesDropdownActionCheck = 'js-roles-dropdown-action-check';
	var rolesToggleDefault = '.js-roles-dropdown-default'; 
	var rolesToggleCurrent = '.js-roles-dropdown-current';
	var reportPlayersNav = '.js-report-players-nav';

	function updateRolesAllAccess() {
		// get all the inactive permissions
		var inactivePermissions = $('.' + rolesDropdownActionCheck + ':not(:checked), ' + rolesSubItemCheck + ':not(:checked), ' + rolesItemCheck + ':not(:checked) ').length;

		if(!inactivePermissions) {
			$(rolesAllAccess).prop('checked', 'checked');
		} else {
			$(rolesAllAccess).prop('checked', false);
		}
	}

	// @preserve jQuery Autocomplete plugin v1.2.6
 	// @homepage http://xdsoft.net/jqplugins/autocomplete/
	$(autoComplete).autocomplete({
		source:[gamesAutocomplete],
		dropdownStyle: {
			position: 'absolute',
			left: 0,
			width: 'auto',
			top: '100%',
			right: 0,
			zIndex: 2,
			backgroundColor: '#fff'
		},
		limit: 10, 
		showHint: false,
	});

 	// @homepage https://select2.org/
	$(select2).select2({
		width: '100%',
		theme: 'elegance'
	});

	$(menuItem).on('click', function() {
		var thisSubMenu = $(this).next(subMenu);
		var li = $(this).parent();

		if ( !li.hasClass(menuItemOpen) ) {
			li.addClass(menuItemOpen);
			thisSubMenu.slideDown(400);
		} else {
			li.removeClass(menuItemOpen);
			thisSubMenu.slideUp(400);
		}
		return false;
	});

	$(document).ready(function() {
		$(subMenu).find(subMenuActive).closest('.sub-menu').css('display', 'block');
		$(subMenu).find(subMenuActive).closest('.sub-menu').closest('.menu__item').addClass('menu__item--open');
	});

	$(navToggle).click(function() {
		$(nav).toggleClass(navOpen);
		$(wrapper).toggleClass(navOpen);
		$(menuItem).removeClass(menuItemOpen);
		if(!$(subMenu + ' ' + subMenuActive).length) {
			$(subMenu).slideUp(300);
		}
		if( $('.' + navOpen).length ) {
			$('html').css('overflow', 'hidden');
			$(header).css({
				'position': 'absolute',
				'top' : $(window).scrollTop()
			});
		} else {
			setTimeout(function () {
				$('html').removeAttr('style');
				$(header).removeAttr('style');
			}, 250);
		}
	});

	$(window).scroll(function() {

		if ($(this).scrollTop() > 0) {
			$(searchCollapse).css({
				"position": 'absolute',
				"top": $(this).scrollTop() + $(header).height()
			});
		} else {
			$(searchCollapse).removeAttr('style');
		}
	});

	$(searchCollapse).on('shown.bs.collapse',  function () {
		$(autoComplete).focus();
	});

	$(tableCardView).click(function() {
		var target = $(this).data('target');
		var view = $(this).data('view');
		var shadow = $(target).closest('.table-responsive-shadow');

		$(tableCardView + '.active').removeClass('active').attr('aria-expanded', 'false');
		$(this).addClass('active').attr('aria-expanded', 'true');

		if ( view === 'table' ) {
			$(target).removeClass('table--card');
			shadow.removeClass('disabled');
		}
		else if ( view === 'card' ) {
			$(target).addClass('table--card');
			shadow.addClass('disabled');
		}
	});

	$(tooltip).tooltip();

	$(languageItem).on('show.bs.tab', function (e) {
		$(languageItemMobile).html(e.target.innerHTML + '<i class="wmd wmd-25 float-right">');
		$(collapseLanguage).collapse('hide');
	});

	$(imagePreview).magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: false,
		fixedContentPos: true,
		preloader: false,
		image: {
			verticalFit: true
		},
		zoom: {
			enabled: true,
			duration: 300
		},
		callbacks: {
    	elementParse: function(item) {
    		$('body').append('<img class="before-mfp-img" src="'+ item.src +'" alt="" />');
    		var img = $('.before-mfp-img');
    		imagePreviewWidth = img[0].naturalWidth;
				imagePreviewHeight = img[0].naturalHeight;
				img.remove();
	    },
	    open: function() {
	    	var img = $('.mfp-img');

	    	img.attr({
	    		width: imagePreviewWidth,
	    		height: imagePreviewHeight
	    	});
		  }
	  }
	});

	$(bonusType).change(function() {
		var value = $(this).val();

		switch (value) { 
			case '1':
			case '2':
				$('.js-bonus-trophy-cats').addClass('d-none');
				$('.js-bunes-min-deposit').removeClass('d-none');
				$('.js-bonus-countries').removeClass('d-none');
				break;
			case '3':
				$('.js-bonus-trophy-cats').removeClass('d-none');
				$('.js-bunes-min-deposit').addClass('d-none');
				$('.js-bonus-countries').addClass('d-none');
				break;
			case '4':
			case '8':
			case '9':
				$('.js-bonus-trophy-cats').addClass('d-none');
				$('.js-bunes-min-deposit').addClass('d-none');
				$('.js-bonus-countries').addClass('d-none');
				break;
			case '5':
			case '6':
			case '7':
				$('.js-bonus-trophy-cats').addClass('d-none');
				$('.js-bunes-min-deposit').addClass('d-none');
				$('.js-bonus-countries').removeClass('d-none');
				break;
			default:
				$('.js-bonus-trophy-cats').addClass('d-none');
				$('.js-bunes-min-deposit').removeClass('d-none');
				$('.js-bonus-countries').removeClass('d-none');
		}
	});

	$(addReward).click(function() {
		$(cloneReward + '> .form__group').clone().appendTo($(cloneWrapper) );

		$(cloneWrapper + '> .form__group').find('select').select2({
			width: '100%',
			theme: 'elegance'
		});

		$(tooltip).tooltip();
	});

	$(document).on('click', removeReward, function() {
		var trigger = $(this).closest('.form__group');
		trigger.remove();
	});

	$(addRepeater).click(function() {
		var thisCloneWrapper = $(this).closest(cloneRepeaterWrapper);
		var thisCloneItem = $(thisCloneWrapper).find(cloneRepeaterItem);
		var thisCloneHtml = $(thisCloneItem).html();
		console.log(thisCloneHtml);
		$(thisCloneWrapper).prepend(thisCloneHtml);

		$(thisCloneItem).find('select').select2({
			width: '100%',
			theme: 'elegance'
		});

		$(tooltip).tooltip();
	});

	$(document).on('click', cloneRepeaterRemove, function() {
		var trigger = $(this).closest('.repeater-item');
		trigger.remove();
	});

	$(".js-irs").ionRangeSlider();

  $(".form_datetime").datetimepicker({format: 'dd/mm/yyyy hh:ii', minuteStep: 1});

  $(".form_period_date").datetimepicker({
  	format: 'mm / dd',
  	MaxView: 2,
  	minView: 2,
  	autoclose: true
  });

  $('input[name="stringtype"]').change(function () {
  	var target = $(this).data('target');
    $(target).collapse('show');
	});

	$('.js-trigger-type').on('shown.bs.tab', function (e) {
		$('.js-trigger-options').removeClass('d-none');
	});

	$('.js-radio-tab').on('shown.bs.tab', function (e) {
	  $(e.target).find('input').prop('checked', true);
	});

	$(btnMediaLibrary).click(function() {
		
		if ( $(this).hasClass('selected') ) {
			$(this).removeClass('selected');
			$(containerMediaLibrary).removeClass('has-selected');
		} else {
			$(btnMediaLibrary).removeClass('selected');
			$(this).addClass('selected');
			$(containerMediaLibrary).addClass('has-selected');
		}
	});

	$(btnMediaLibrarySidebarClose).click(function() {
		$(btnMediaLibrary).removeClass('selected');
		$(containerMediaLibrary).removeClass('has-selected');
	});

	$( tableSortable ).sortable({
		handle: ".ui-sortable-move",
    cancel: "",
	});
	$( tableSortable ).disableSelection();
	
	$( bonusSort ).sortable({
		placeholder: "col-lg-2 col-sm-3 col-6 mb-20 px-10 d-block bonus__placeholder",
		forcePlaceholderSize: true,
		stop: function(event, ui) {
			var items = event.target.children;
			$.each(items, function (i, e) {
				$(e).find('.bonus__num').text(++i);
			});
		}
	});
  $( bonusSort ).disableSelection();

  $(WFItemsType).on('change', function() {
  	var target = '#' + $(this).val();

  	if ( $(target).length ) {
	  	$('body').append('<ul class="nav js-items-nav"><li><a href="'+ target +'" data-toggle="tab" class="js-items-tab"></a></li></ul>');
	  	$('.js-items-tab').tab('show');
	  	$('.js-items-nav').remove();
	  }	else {
  		$('.js-items-tab-content .tab-pane.active').removeClass('active');
  	}
  });

	$('button[data-toggle="tab"]').on('hide.bs.tab', function (e) {
	  $('#previewEmailModdal .modal-dialog').removeAttr('style');
	});

  $('button[data-target="#fullscreen"]').on('shown.bs.tab', function (e) {
	  $('#previewEmailModdal .modal-dialog').css('max-width', '100%');
	});

	$(document).on('click', '.dropdown-menu', function (e) {
	  e.stopPropagation();
	});

	$(rolesExpand).click(function() {
		$(rolesItem).find('.collapse').collapse('show');
	});

	$(rolesCollapse).click(function() {
		$(rolesItem).find('.collapse').collapse('hide');
	});

	$(rolesAllAccess).change(function() {
		if ($(this).prop('checked')) {
			$(rolesItemCheck).prop('checked', 'checked');
			$(rolesSubItemCheck).prop('checked', 'checked');
			$(rolesDropdownCheck).prop('checked', 'checked');
			$(rolesSubItem).addClass('active');
		} else {
			$(rolesItemCheck).prop('checked', false);
			$(rolesSubItemCheck).prop('checked', false);
			$(rolesDropdownCheck).prop('checked', false);
			$(rolesSubItem).removeClass('active');
		}
		rolesSettingsLabels(rolesItem);
	});

	$(rolesItemCheck).change(function() {
		var item = $(this).closest(rolesItem);
		var subItems = item.find(rolesSubItemCheck);
		var dropdownCheck = item.find(rolesDropdownCheck);

		if ($(this).prop('checked')) {
			subItems.prop('checked', 'checked');
			dropdownCheck.prop('checked', 'checked');
			$(subItems).closest(rolesSubItem).addClass('active');
		} else {
			subItems.prop('checked', false);
			dropdownCheck.prop('checked', false);
			$(subItems).closest(rolesSubItem).removeClass('active');
		}

		updateRolesAllAccess();

		rolesSettingsLabels(item);
	});

	$(rolesSubItemCheck).change(function() {
		var thisItem = $(this).closest(rolesItem);
		var subItem = $(this).closest(rolesSubItem);
		var itemCheck = subItem.closest(rolesItem).find(rolesItemCheck);
		var totalSubRoles = thisItem.find(rolesSubItemCheck).length;
		var subRolesChecked = thisItem.find(rolesSubItemCheck + ':checked').length;

		if ($(this).prop('checked')) {
			subItem.addClass('active');
		} else {
			subItem.removeClass('active');
		}

		if ( totalSubRoles === subRolesChecked) {
			itemCheck.prop('checked', 'checked');
		} else {
			itemCheck.prop('checked', false);
		}

		updateRolesAllAccess();

		rolesSettingsLabels(subItem);
	});

	$(rolesDropdownCheck).change(function() {
		var $this = $(this);
		var dropdown = $(this).closest(rolesDropdown);
		var allCheck = dropdown.find(rolesDropDownAllCkeck);
		var checkboxes = null;
		var dropdownAll = null;
		var TotalDropdownCheck = dropdown.find(rolesDropdownCheck + ':not('+ rolesDropDownAllCkeck +')').length;
		var dropdownChecked = null;
		rolesItemDropdownChecked = [];

		if ( $this.val() !== 'all' ) {
			allCheck.prop('checked', false);
		} else {
			checkboxes = dropdown.find(rolesDropdownCheck);

				if ( $this.prop('checked') ) {
					checkboxes.prop('checked', 'checked');
				} else {
					checkboxes.prop('checked', false);
				}
		}

		if ( $this.closest(rolesSubItem).length) {

			if ( $this.hasClass(rolesDropdownLangCheck) ) {
				dropdownAll = $this.closest(rolesItem).find('.roles__item__header .' +  rolesDropdownLangCheck);
			} else if ( $this.hasClass(rolesDropdownActionCheck) ) {
				dropdownAll = $this.closest(rolesItem).find('.roles__item__header .' +  rolesDropdownActionCheck);
			}
			
			dropdownAll.prop('checked', false);
			rolesSettingsLabels($this.closest(rolesItem));

		} else if ( $this.closest(rolesItem).length ) {

			if ( $this.val() === 'all' ) {
				if ( $this.hasClass(rolesDropdownLangCheck) ) {
					checkboxes = $this.closest(rolesItem).find('.' + rolesDropdownLangCheck);
				} else if ( $this.hasClass(rolesDropdownActionCheck) ) {
					checkboxes = $this.closest(rolesItem).find('.' + rolesDropdownActionCheck);
				}

				if ( $this.prop('checked') ) {
					checkboxes.prop('checked', 'checked');
				} else {
					checkboxes.prop('checked', false);
				}

				rolesSettingsLabels($this.closest(rolesItem));
			} else {

				if ( $this.hasClass(rolesDropdownLangCheck) ) {
					checkboxes = $this.closest(rolesItem).find(rolesSubItem +' .' + rolesDropdownLangCheck);
				} else if ( $this.hasClass(rolesDropdownActionCheck) ) {
					checkboxes = $this.closest(rolesItem).find(rolesSubItem + ' .' + rolesDropdownActionCheck);
				}

				checkboxes.prop('checked', false);

				dropdown.find(rolesDropdownCheck + ':checked:not('+ rolesDropDownAllCkeck +')').each(function(i, e) {
					rolesItemDropdownChecked.push($(e).val());
				});

				checkboxes.each(function(i, e) {
					var eventDroprop = $(e).closest(rolesDropdown);
					var eventDropropAll = eventDroprop.find(rolesDropDownAllCkeck);

					if ( $.inArray($(e).val(), rolesItemDropdownChecked) !== -1 ) {
						$(e).prop('checked', 'checked');

						var eventTotalDropdownCheck = eventDroprop.find(rolesDropdownCheck + ':not('+ rolesDropDownAllCkeck +'):not(:checked)').length;
						if ( eventTotalDropdownCheck === 0 && $(e).val() !== 'all' ) {
							eventDropropAll.prop('checked', 'checked');
						}
					} else if ( $(e).val() === 'all' ) {
						$(e).prop('checked', false);
					}
				});

				rolesSettingsLabels($this.closest(rolesItem));
			}
		}

		dropdownChecked = dropdown.find(rolesDropdownCheck + ':checked:not('+ rolesDropDownAllCkeck +')').length;

		if ( TotalDropdownCheck === dropdownChecked ) {
			allCheck.prop('checked', 'checked');
		}

		updateRolesAllAccess();
	});

	$(reportPlayersNav + ' button').on('click', function() {
		if ( $(window).width() < 768 ) {
			$(this).prevAll('button').toggle();
			$(this).nextAll('button').toggle();
		}
	});

	function rolesSettingsLabels( selector ) {
		var dropdown = $(selector).find(rolesDropdown);

		$(dropdown).each(function(i, e) {
			var checkboxes = $(e).find(rolesDropdownCheck);
			var toggleDefault = $(e).find(rolesToggleDefault);
			var toggleCurrent = $(e).find(rolesToggleCurrent);
			var labels = [];

			checkboxes.each(function(j, check) {
				if ( $(check).prop('checked') && $(check).val() !== 'all' ) {
					labels.push($(check).val());
				} 
			});

			if (labels.length) {
				toggleDefault.addClass('d-none');
				toggleCurrent.removeClass('d-none').addClass('d-block');
				toggleCurrent.html(labels.join());
			} else {
				toggleDefault.removeClass('d-none');
				toggleCurrent.addClass('d-none').removeClass('d-block').html('');
			}
		});
	}
	window.initPicker = function(selector) {
		var pickr = [];
		var pickerValue = selector.nextAll('.js-color-picker-value');

		selector.each(function (i, e) {
			pickr[i] = Pickr.create({
				el: e,
				theme: 'nano',
				position: 'bottom-middle',
				useAsButton: true,
				default: $(e).data('value'),
				adjustableNumbers: false,
				inline: true,
				swatches: [
					'#726b7a',
					'#605667',
					'#453C4A',
					'#353d4a',
					'#212529',
					'#4ca7a0',
					'#452c58',
					'#735985',
					'#927ea0',
					'#54356b',
					'#f5d08f',
					'#5ebbb3',
					'#ce201d',
					'#ea7f85'
				],
				components: {
					preview: true,
					hue: true,
					interaction: {
						hex: true,
            input: true,
            save: true
					}
				}
			});

			$(pickerValue).keydown(function (e) { 
				return false;
			});

			$(pickerValue).focus(function () {
				$(this).prevAll('.pcr-app').show();
			});
	
			function setColor(color, instance) {
				var el = $(instance);
				var selectedColor = color.toHEXA().toString();
				el.val(selectedColor);
				el.nextAll('.color-picker-bgcircle').css('background-color', color.toHEXA());
			}
		
			pickr[i].on('save', function(color, instance) {
				setColor(color, pickerValue[i]);
				$(instance._root.app).hide();
			}).on('swatchselect', function(color) {
				setColor(color, pickerValue[i]);
			}).on('change', function(color) {
				setColor(color, pickerValue[i]);
			});
		});

		$('.js-color-picker').change(function() {
			$(this).next('.color-picker-bgcircle').css('background-color', $(this).val());
		});

		$('.js-color-picker').focus(function() {
			$(this).next('.pcr-app').show();
		});
	};

	window.initPicker($('.js-color-picker'));
});
