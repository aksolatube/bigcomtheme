import _ from 'lodash';
import utils from '@bigcommerce/stencil-utils';
import StencilDropDown from './stencil-dropdown';

export default function () {
    const TOP_STYLING = 'top: 49px;';
    const $quickSearchResults = $('.quickSearchResults');
    const $quickSearchDynamic = $quickSearchResults.find('[data-quick-search-dynamic]');
    const $quickSearchGuides = $quickSearchResults.find('[data-quick-search-guides]');
    const $quickSearchForms = $('[data-quick-search-form]');
    const $quickSearchExpand = $('#quick-search-expand');
    const $searchQuery = $quickSearchForms.find('[data-search-quick]');
    const stencilDropDownExtendables = {
        hide: () => {
            $quickSearchExpand.attr('aria-expanded', false);
            $searchQuery.attr('aria-expanded', 'false').trigger('blur');
        },
        show: (event) => {
            $quickSearchExpand.attr('aria-expanded', true);
            $searchQuery.attr('aria-expanded', 'true').trigger('focus');
            event.stopPropagation();
        },
    };
    const stencilDropDown = new StencilDropDown(stencilDropDownExtendables);
    stencilDropDown.bind($('[data-search="quickSearch"]'), $('#quickSearch'), TOP_STYLING);

    stencilDropDownExtendables.onBodyClick = (e, $container) => {
        if ($(e.target).closest('[data-prevent-quick-search-close], .modal-background').length === 0) {
            stencilDropDown.hide($container);
        }
    };

    let requestSequence = 0;
    let activeOptionIndex = -1;

    const setExpanded = expanded => {
        $searchQuery.attr('aria-expanded', expanded ? 'true' : 'false');
    };

    const clearActiveOption = () => {
        activeOptionIndex = -1;
        $searchQuery.attr('aria-activedescendant', '');
        $quickSearchResults.find('[role="option"]').removeClass('is-active').attr('aria-selected', 'false');
    };

    const getVisibleOptions = () => $quickSearchResults.find('[role="option"]').filter(':visible');

    const activateOption = index => {
        const $options = getVisibleOptions();

        if (!$options.length) {
            clearActiveOption();
            return;
        }

        activeOptionIndex = (index + $options.length) % $options.length;
        $options.removeClass('is-active').attr('aria-selected', 'false');

        const $active = $options.eq(activeOptionIndex);
        $active.addClass('is-active').attr('aria-selected', 'true');
        $searchQuery.attr('aria-activedescendant', $active.attr('id'));

        if ($active.get(0) && $active.get(0).scrollIntoView) {
            $active.get(0).scrollIntoView({ block: 'nearest' });
        }
    };

    const showGuides = () => {
        $quickSearchDynamic.empty();
        $quickSearchGuides.show();
        $quickSearchResults.attr('aria-busy', 'false').show();
        setExpanded(true);
    };

    const showShortQueryHint = () => {
        $quickSearchGuides.hide();
        $quickSearchDynamic.html('<p class="quickSearchHint quickSearchHint--standalone">Keep typing&hellip; enter at least 3 characters.</p>');
        $quickSearchResults.attr('aria-busy', 'false').show();
        setExpanded(true);
    };

    const showLoading = () => {
        $quickSearchGuides.hide();
        $quickSearchDynamic.html('<div class="quickSearchLoading" role="status"><span class="quickSearchSpinner" aria-hidden="true"></span>Searching products&hellip;</div>');
        $quickSearchResults.attr('aria-busy', 'true').show();
        setExpanded(true);
    };

    const debounceWaitTime = 300;
    const doSearch = _.debounce((searchQuery, sequence) => {
        utils.api.search.search(searchQuery, { template: 'search/quick-results' }, (err, response) => {
            const currentQuery = $.trim($searchQuery.filter(':focus').val() || $searchQuery.first().val());

            if (sequence !== requestSequence || currentQuery !== searchQuery) {
                return false;
            }

            $quickSearchResults.attr('aria-busy', 'false');

            if (err) {
                $quickSearchDynamic.html('<p class="quickSearchMessage" role="status">Search is temporarily unavailable. Please try again.</p>');
                return false;
            }

            $quickSearchDynamic.html(response);
            clearActiveOption();
            const $quickSearchResultsCurrent = $quickSearchResults.filter(':visible');
            const $noResultsMessage = $quickSearchResultsCurrent.find('.quickSearchMessage');

            if ($noResultsMessage.length) {
                $noResultsMessage.attr({
                    role: 'status',
                    'aria-live': 'polite',
                });
            } else {
                const $quickSearchAriaMessage = $quickSearchResultsCurrent.next();
                $quickSearchAriaMessage.addClass('u-hidden');

                const predefinedText = $quickSearchAriaMessage.data('search-aria-message-predefined-text');
                const itemsFoundCount = $quickSearchResultsCurrent.find('.quickSearchProduct').length;

                $quickSearchAriaMessage.text(`${itemsFoundCount} ${predefinedText} ${searchQuery}`);

                setTimeout(() => {
                    $quickSearchAriaMessage.removeClass('u-hidden');
                }, 100);
            }

            return true;
        });
    }, debounceWaitTime);

    utils.hooks.on('search-quick', (event, currentTarget) => {
        const searchQuery = $.trim($(currentTarget).val());

        requestSequence += 1;
        doSearch.cancel();
        clearActiveOption();

        if (searchQuery.length === 0) {
            showGuides();
            return;
        }

        if (searchQuery.length < 3) {
            showShortQueryHint();
            return;
        }

        showLoading();
        doSearch(searchQuery, requestSequence);
    });

    $searchQuery.on('focus', event => {
        if ($.trim($(event.currentTarget).val()).length === 0) {
            showGuides();
        } else {
            $quickSearchResults.show();
            setExpanded(true);
        }
    });

    $searchQuery.on('keydown', event => {
        const $options = getVisibleOptions();

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            $quickSearchResults.show();
            setExpanded(true);
            activateOption(activeOptionIndex + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            $quickSearchResults.show();
            setExpanded(true);
            activateOption(activeOptionIndex < 0 ? $options.length - 1 : activeOptionIndex - 1);
        } else if (event.key === 'Enter' && activeOptionIndex >= 0) {
            const option = $options.get(activeOptionIndex);

            if (option && option.href) {
                event.preventDefault();
                window.location.assign(option.href);
            }
        } else if (event.key === 'Escape') {
            event.preventDefault();
            clearActiveOption();
            $quickSearchResults.hide();
            setExpanded(false);
        }
    });

    $quickSearchResults.on('mouseenter', '[role="option"]', event => {
        const $options = getVisibleOptions();
        activateOption($options.index(event.currentTarget));
    });

    const navigateToSearchResults = $target => {
        const searchQuery = $.trim($target.find('input').val());
        const searchUrl = $target.data('url');

        if (searchQuery.length === 0) {
            return;
        }

        window.location.assign(`${searchUrl}?search_query=${encodeURIComponent(searchQuery)}`);
    };

    $quickSearchForms.on('submit', event => {
        event.preventDefault();
        navigateToSearchResults($(event.currentTarget));
    });

    $quickSearchResults.on('click', '.quickSearchAll', event => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const $visibleForm = $quickSearchForms.filter(':visible').first();
        navigateToSearchResults($visibleForm.length ? $visibleForm : $quickSearchForms.first());
    });
}
