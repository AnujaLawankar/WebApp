import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AppActions from '../../actions/AppActions';
import OrganizationActions from '../../actions/OrganizationActions';
import VoterGuideActions from '../../actions/VoterGuideActions';
import AppStore from '../../stores/AppStore';
import OrganizationStore from '../../stores/OrganizationStore';
import VoterGuideStore from '../../stores/VoterGuideStore';
import VoterStore from '../../stores/VoterStore';
import { renderLog } from '../../utils/logging';
import { abbreviateNumber, arrayContains } from '../../utils/textFormat';
import LoadingWheel from '../LoadingWheel';

const SettingsAccount = React.lazy(() => import('../Settings/SettingsAccount'));
const VoterGuideChooseElectionWithPositionsModal = React.lazy(() => import('./VoterGuideChooseElectionWithPositionsModal'));
const VoterGuideEndorsements = React.lazy(() => import('./VoterGuideEndorsements'));
const VoterGuideFollowers = React.lazy(() => import('./VoterGuideFollowers'));
const VoterGuideFollowing = React.lazy(() => import('./VoterGuideFollowing'));

export default class OrganizationVoterGuideTabs extends Component {
  // static getDerivedStateFromProps (props, state) {
  //   const { defaultTabItem } = state;
  //   // console.log('Friends getDerivedStateFromProps defaultTabItem:', defaultTabItem, ', params.tabItem:', props.params.tabItem);
  //   // We only redirect when in mobile mode (when "displayFriendsTabs()" is true), a tab param has not been passed in, and we have a defaultTab specified
  //   // This solves an edge case where you re-click the Friends Footer tab when you are in the friends section
  //   if (displayFriendsTabs() && props.params.tabItem === undefined && defaultTabItem) {
  //     historyPush(`/friends/${defaultTabItem}`);
  //   }
  //   return null;
  // }

  constructor (props) {
    super(props);
    this.state = {
      activeRoute: '',
      allOrganizationPositionsLength: 0,
      organization: {},
      organizationWeVoteId: '',
      scrollDownValue: 0,
      showElectionsWithOrganizationVoterGuidesModal: false,
      voter: {},
      voterGuideFollowedList: [],
      voterGuideFollowersList: [],
    };

    this.voterGuideBallotReference = {};
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount () {
    const { activeRoute, organizationWeVoteId } = this.props;
    // console.log('OrganizationVoterGuideTabs, componentDidMount, organizationWeVoteId: ', this.props.organizationWeVoteId);
    this.appStoreListener = AppStore.addListener(this.onAppStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
    OrganizationActions.organizationsFollowedRetrieve();
    VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(organizationWeVoteId);
    VoterGuideActions.voterGuideFollowersRetrieve(organizationWeVoteId);
    VoterGuideActions.voterGuidesRecommendedByOrganizationRetrieve(organizationWeVoteId, VoterStore.electionId());
    // Positions for this organization, for this voter / election
    OrganizationActions.positionListForOpinionMaker(organizationWeVoteId, true); // Needed for friends
    // Positions for this organization, NOT including for this voter / election
    OrganizationActions.positionListForOpinionMaker(organizationWeVoteId, false, true);
    // New call for all positions
    OrganizationActions.positionListForOpinionMaker(organizationWeVoteId, false, false);
    // Get all of this organization's voter guides so we know which elections to offer
    VoterGuideActions.voterGuidesRetrieve(organizationWeVoteId);
    const allOrganizationPositions = OrganizationStore.getAllOrganizationPositions(organizationWeVoteId);
    const allOrganizationPositionsLength = allOrganizationPositions.length || 0;

    // console.log('OrganizationVoterGuideTabs, componentDidMount, this.props.activeRoute: ', activeRoute);
    this.setState({
      activeRoute: activeRoute || 'positions',
      allOrganizationPositionsLength,
      organizationWeVoteId,
      organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
      pathname: window.location.pathname,
      showElectionsWithOrganizationVoterGuidesModal: AppStore.showElectionsWithOrganizationVoterGuidesModal(),
      voter: VoterStore.getVoter(),
    });

    window.addEventListener('scroll', this.handleScroll);
    document.body.scrollTop = this.state.scrollDownValue;
  }

  // eslint-disable-next-line camelcase,react/sort-comp
  UNSAFE_componentWillReceiveProps (nextProps) {
    // console.log('OrganizationVoterGuideTabs, componentWillReceiveProps');
    // When a new organization is passed in, update this component to show the new data
    // let different_election = this.state.current_google_civic_election_id !== VoterStore.electionId();
    const { organizationWeVoteId } = this.state;
    const differentOrganization = organizationWeVoteId !== nextProps.organizationWeVoteId;
    if (differentOrganization) {
      // console.log('OrganizationVoterGuideTabs, componentWillReceiveProps differentOrganization');
      OrganizationActions.organizationsFollowedRetrieve();
      VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(nextProps.organizationWeVoteId);
      VoterGuideActions.voterGuideFollowersRetrieve(nextProps.organizationWeVoteId);
      VoterGuideActions.voterGuidesRecommendedByOrganizationRetrieve(nextProps.organizationWeVoteId, VoterStore.electionId());
      // DALE 2017-12-24 Causes too much churn when here
      // Positions for this organization, for this voter / election
      // OrganizationActions.positionListForOpinionMaker(nextProps.organizationWeVoteId, true);
      // Positions for this organization, NOT including for this voter / election
      // OrganizationActions.positionListForOpinionMaker(nextProps.organizationWeVoteId, false, true);
      // New call for all positions
      OrganizationActions.positionListForOpinionMaker(nextProps.organizationWeVoteId, false, false);
      this.setState({
        organizationWeVoteId: nextProps.organizationWeVoteId,
        organization: OrganizationStore.getOrganizationByWeVoteId(nextProps.organizationWeVoteId),
      });
    }
    // console.log('OrganizationVoterGuideTabs, componentWillReceiveProps, nextProps.activeRoute: ', nextProps.activeRoute);
    if (nextProps.activeRoute) {
      this.setState({
        activeRoute: nextProps.activeRoute,
      });
    }
    // this.setState({
    //   pathname: nextProps.location.pathname,
    // });
  }

  // 2019-09-29 Dale: I'm having trouble getting the first voter guide page to display Ballot items without this commented out
  // shouldComponentUpdate (nextProps, nextState) {
  //   if (this.state.activeRoute !== nextState.activeRoute) {
  //     // console.log('shouldComponentUpdate: this.state.activeRoute', this.state.activeRoute, ', nextState.activeRoute', nextState.activeRoute);
  //     return true;
  //   }
  //   if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
  //     // console.log('shouldComponentUpdate: this.state.organizationWeVoteId', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId', nextState.organizationWeVoteId);
  //     return true;
  //   }
  //   if (this.state.location !== nextState.location) {
  //     // console.log('shouldComponentUpdate: this.state.location', this.state.location, ', nextState.location', nextState.location);
  //     return true;
  //   }
  //   if (this.state.pathname !== nextState.pathname) {
  //     // console.log('shouldComponentUpdate: this.state.pathname', this.state.pathname, ', nextState.pathname', nextState.pathname);
  //     return true;
  //   }
  //   // console.log('shouldComponentUpdate no changes');
  //   return false;
  // }

  componentWillUnmount () {
    this.appStoreListener.remove();
    this.organizationStoreListener.remove();
    this.voterGuideStoreListener.remove();
    this.voterStoreListener.remove();
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll () {
    this.setState({ scrollDownValue: window.scrollY });
    // console.log('Scrolling', window.scrollY);
  }

  onOrganizationStoreChange () {
    const { organizationWeVoteId } = this.state;
    // console.log('OrganizationVoterGuideTabs onOrganizationStoreChange, organizationWeVoteId: ', organizationWeVoteId);
    const allOrganizationPositions = OrganizationStore.getAllOrganizationPositions(organizationWeVoteId);
    const allOrganizationPositionsLength = allOrganizationPositions.length || 0;
    this.setState({
      allOrganizationPositionsLength,
      organization: OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId),
    });
  }

  onVoterStoreChange () {
    this.setState({
      voter: VoterStore.getVoter(),
    });
  }

  onVoterGuideStoreChange () {
    // console.log('OrganizationVoterGuideTabs, onVoterGuideStoreChange, organization: ', this.state.organization);
    const { organization_we_vote_id: organizationWeVoteId } = this.state.organization;
    this.setState({
      voterGuideFollowedList: VoterGuideStore.getVoterGuidesFollowedByOrganization(organizationWeVoteId),
      voterGuideFollowersList: VoterGuideStore.getVoterGuidesFollowingOrganization(organizationWeVoteId),
    });
  }

  onAppStoreChange () {
    this.setState({
      showElectionsWithOrganizationVoterGuidesModal: AppStore.showElectionsWithOrganizationVoterGuidesModal(),
    });
  }

  switchTab (destinationTab) {
    // console.log('OrganizationVoterGuideTabs switchTab, destinationTab:', destinationTab);
    const availableTabsArray = ['following', 'followers', 'positions']; // 'ballot' removed
    if (arrayContains(destinationTab, availableTabsArray)) {
      this.setState({
        activeRoute: destinationTab,
      });
      // This is an expensive action as it reloads quite a bit of data from the API server
      const currentUrl = this.state.pathname;
      const arrayLength = availableTabsArray.length;
      let modifiedUrl = this.state.pathname;
      let formerTabLength = 0;
      let formerTabLengthWithSlash = 0;
      for (let i = 0; i < arrayLength; i++) {
        // Remove any values in availableTabsArray from the end of the URL
        if (currentUrl.endsWith(availableTabsArray[i])) {
          formerTabLength = availableTabsArray[i].length;
          formerTabLengthWithSlash = formerTabLength + 1;
          modifiedUrl = currentUrl.slice(0, -formerTabLengthWithSlash);
          // break;
        }
      }
      modifiedUrl = `${modifiedUrl}/${destinationTab}`;
      // console.log('modifiedUrl:', modifiedUrl);
      this.props.activeRouteChanged(destinationTab);
      // eslint-disable-next-line no-restricted-globals
      history.pushState({
        id: `tabs-${modifiedUrl}`,
      }, '', `${modifiedUrl}`);
    }
  }

  closeShowElectionsWithOrganizationVoterGuidesModal () {
    // console.log('VoterGuideListDashboard closeShowElectionsWithOrganizationVoterGuidesModal');
    AppActions.setShowElectionsWithOrganizationVoterGuidesModal(false);
  }

  render () {
    renderLog('OrganizationVoterGuideTabs');  // Set LOG_RENDER_EVENTS to log all renders
    document.body.scrollTop = this.state.scrollDownValue;
    const {
      activeRoute, allOrganizationPositionsLength, organizationWeVoteId,
      pathname, showElectionsWithOrganizationVoterGuidesModal, voter,
    } = this.state;
    let params;
    if (this.props.match) {
      params = this.props.match.params;    // From Root.js URL
    } else {
      params = this.props.params;          // From pushHistory
    }

    if (!pathname || !activeRoute || !organizationWeVoteId || !voter) {
      return <div>{LoadingWheel}</div>;
    }
    // console.log('allOrganizationPositionsLength:', allOrganizationPositionsLength);

    let lookingAtSelf = false;
    if (this.state.voter) {
      lookingAtSelf = this.state.voter.linked_organization_we_vote_id === organizationWeVoteId;
    }
    let followingTitleLong = '';
    let followingTitleShort = '';
    let followersTitle = '';
    let voterGuideFollowersList = this.state.voterGuideFollowersList || [];
    if (this.state.voter.linked_organization_we_vote_id === organizationWeVoteId) {
      // If looking at your own voter guide, filter out your own entry as a follower
      voterGuideFollowersList = voterGuideFollowersList.filter((oneVoterGuide) => (oneVoterGuide.organization_we_vote_id !== this.state.voter.linked_organization_we_vote_id ? oneVoterGuide : null));
    }
    if (lookingAtSelf) {
      followingTitleLong = this.state.voterGuideFollowedList.length === 0 ?
        'Following' : `Following ${this.state.voterGuideFollowedList.length}`;
      followingTitleShort = 'Following';
      followersTitle = voterGuideFollowersList.length === 0 ?
        'Followers' : `${voterGuideFollowersList.length} Followers`;
    } else {
      followingTitleLong = this.state.voterGuideFollowedList.length === 0 ?
        'Following' : `Following ${this.state.voterGuideFollowedList.length}`;
      followingTitleShort = 'Following';
      followersTitle = voterGuideFollowersList.length === 0 ?
        'Followers' : `${voterGuideFollowersList.length} Followers`;
    }

    let voterGuideComponentToDisplay = null;
    // console.log('activeRoute:', activeRoute);
    switch (activeRoute) {
      // case 'ballot':
      //   voterGuideComponentToDisplay = (
      //     <VoterGuideBallot
      //       organizationWeVoteId={organizationWeVoteId}
      //       activeRoute={activeRoute}
      //       location={this.props.location}
      //       params={params}
      //       ref={(ref) => { this.voterGuideBallotReference = ref; }}
      //     />
      //   );
      //   break;
      default:
      case 'positions':
        // Was <VoterGuidePositions
        voterGuideComponentToDisplay = (
          <>
            { lookingAtSelf && !this.state.voter.is_signed_in ?
              <SettingsAccount /> :
              null }
            <VoterGuideEndorsements
              activeRoute={activeRoute}
              location={window.location}
              organizationWeVoteId={organizationWeVoteId}
              params={params}
            />
          </>
        );
        break;
      case 'following':
        voterGuideComponentToDisplay = <VoterGuideFollowing organizationWeVoteId={organizationWeVoteId} />;
        break;
      case 'followers':
        voterGuideComponentToDisplay = <VoterGuideFollowers organizationWeVoteId={organizationWeVoteId} />;
        break;
    }

    return (
      <div className="">
        <div className="tabs__tabs-container-wrap u-show-desktop-tablet d-print-none">
          <div className="tabs__tabs-container">
            <ul className="nav tabs__tabs">
              {/* <li className="tab-item"> */}
              {/*  <a // eslint-disable-line */}
              {/*    onClick={() => this.switchTab('ballot')} */}
              {/*    className={activeRoute === 'ballot' ? 'tab tab-active' : 'tab tab-default'} */}
              {/*  > */}
              {/*    Your Ballot */}
              {/*  </a> */}
              {/* </li> */}

              <li className="tab-item">
                <a // eslint-disable-line
                  onClick={() => this.switchTab('positions')}
                  className={activeRoute === 'positions' ? 'tab tab-active' : 'tab tab-default'}
                >
                  {(allOrganizationPositionsLength > 0) && (
                    <>
                      {abbreviateNumber(allOrganizationPositionsLength)}
                      &nbsp;
                    </>
                  )}
                  Endorsements
                </a>
              </li>

              <li className="tab-item">
                <a // eslint-disable-line
                  onClick={() => this.switchTab('following')}
                  className={activeRoute === 'following' ? 'tab tab-active' : 'tab tab-default'}
                >
                  <span>
                    <span className="d-none d-sm-block">{followingTitleLong}</span>
                    <span className="d-block d-sm-none">{followingTitleShort}</span>
                  </span>
                </a>
              </li>

              <li className="tab-item">
                <a // eslint-disable-line
                  onClick={() => this.switchTab('followers')}
                  className={activeRoute === 'followers' ? 'tab tab-active' : 'tab tab-default'}
                >
                  <span>{followersTitle}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        {voterGuideComponentToDisplay}
        {showElectionsWithOrganizationVoterGuidesModal && (
          <VoterGuideChooseElectionWithPositionsModal
            ballotBaseUrl="/ballot"
            organizationWeVoteId={organizationWeVoteId}
            show={showElectionsWithOrganizationVoterGuidesModal}
            toggleFunction={this.closeShowElectionsWithOrganizationVoterGuidesModal}
            pathname={pathname}
          />
        )}
      </div>
    );
  }
}
OrganizationVoterGuideTabs.propTypes = {
  activeRoute: PropTypes.string,
  activeRouteChanged: PropTypes.func,
  organizationWeVoteId: PropTypes.string.isRequired,
  match: PropTypes.object,
  params: PropTypes.object,
};
