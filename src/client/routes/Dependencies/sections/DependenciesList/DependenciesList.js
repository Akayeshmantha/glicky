// @flow
import React, { Fragment, Component } from 'react';
import Ink from 'react-ink';
import { PoseGroup } from 'react-pose';

import { Text, Modal, Button, Spacing, Spinner } from '~/components';

import {
  withDependencies,
  type DependenciesContextProps
} from '~/context/DependenciesContext';

import type { Sort, Dependency } from '../../../../../types';

import {
  Header,
  SortContainer,
  SortIcon,
  ColumnTitle,
  TitleTransform,
  Row,
  RowSection,
  Cell,
  PanelWrapper,
  StyledDependencyPanel,
  OutdatedIcon,
  IconHolder,
  DeleteIcon,
  Name
} from './DependenciesList.styles';

type SortKey = 'name' | 'type';

type Props = DependenciesContextProps & {
  filteredDependencies: Array<Dependency>
};

type State = {
  expandedItem: boolean,
  expandedDependency?: Dependency,
  sort: Sort<SortKey>,
  deletingDependency: boolean,
  modalOpen: boolean
};

class DependenciesList extends Component<Props, State> {
  static defaultProps = {};

  state = {
    expandedItem: false,
    modalOpen: false,
    deletingDependency: false,
    sort: {
      key: 'name',
      order: 'asc'
    }
  };

  sortDependencies(dependencies: Array<Dependency>) {
    const { key, order } = this.state.sort;

    const sortedDependencies = [...dependencies].sort((a, b) => {
      // sort by type
      if (key === 'type') {
        if (a.type < b.type) {
          return order === 'asc' ? -1 : 1;
        }
        if (a.type > b.type) {
          return order === 'asc' ? 1 : -1;
        }

        /// fallback to sorting by name if types are the same
        return a.name < b.name ? -1 : 1;
      }

      // sort by name
      if (a.name < b.name) {
        return order === 'asc' ? -1 : 1;
      }
      if (a.name > b.name) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedDependencies;
  }

  setSort = (sortKey: SortKey) => {
    this.setState(prevState => ({
      sort: {
        key: sortKey,
        order:
          prevState.sort.key === sortKey
            ? prevState.sort.order === 'asc'
              ? 'desc'
              : 'asc'
            : 'asc'
      }
    }));
  };

  togglePanel = (dependency: Dependency) => {
    if (this.state.expandedItem && this.state.expandedDependency) {
      const { expandedDependency } = this.state;
      if (expandedDependency.name === dependency.name) {
        return this.setState({
          expandedItem: false
        });
      }
      return this.setState({
        expandedDependency: dependency,
        expandedItem: true
      });
    }
    this.setState({
      expandedItem: true,
      expandedDependency: dependency
    });
  };

  handleDependencyRequestDelete = () => {
    this.setState({
      modalOpen: true
    });
  };

  handleModalRequestClose = () => {
    this.setState({
      modalOpen: false
    });
  };

  handleDependencyDelete = () => {
    if (!this.state.expandedDependency || this.state.deletingDependency) {
      return;
    }
    const { expandedDependency } = this.state;

    this.setState(
      {
        deletingDependency: true
      },
      () => {
        this.props
          .deleteDependency(expandedDependency)
          .then(() => {
            this.setState({
              deletingDependency: false,
              modalOpen: false
            });
          })
          .catch(() => {
            // handle error case
          });
      }
    );
  };

  render() {
    const { filteredDependencies } = this.props;

    const sortedDependencies = this.sortDependencies(filteredDependencies);

    return (
      <Fragment>
        <Header>
          <Row>
            <RowSection>
              <Cell onClick={() => this.setSort('name')}>
                <SortContainer>
                  <SortIcon
                    isActive={this.state.sort.key === 'name'}
                    direction={this.state.sort.order}
                  />
                  <TitleTransform isActive={this.state.sort.key === 'name'}>
                    <ColumnTitle>{'Name'}</ColumnTitle>
                  </TitleTransform>
                </SortContainer>
              </Cell>
            </RowSection>
            <RowSection>
              <Cell numeric>
                <ColumnTitle>{'Package Version'}</ColumnTitle>
              </Cell>
              <Cell onClick={() => this.setSort('type')}>
                <SortContainer>
                  <SortIcon
                    isActive={this.state.sort.key === 'type'}
                    direction={this.state.sort.order}
                  />
                  <TitleTransform isActive={this.state.sort.key === 'type'}>
                    <ColumnTitle>{'Type'}</ColumnTitle>
                  </TitleTransform>
                </SortContainer>
              </Cell>
            </RowSection>
          </Row>
        </Header>
        {sortedDependencies.map(dependency => {
          const expanded =
            this.state.expandedItem &&
            this.state.expandedDependency &&
            this.state.expandedDependency.name === dependency.name;

          return (
            <PanelWrapper
              key={dependency.name}
              pose={expanded ? 'active' : 'inactive'}
              active={expanded}
            >
              <StyledDependencyPanel
                dependency={dependency}
                active={expanded}
                installedVersion={dependency.installedVersion}
                onRequestDelete={this.handleDependencyRequestDelete}
                onRequestUpdate={this.props.updateDependency}
                renderTitle={() => (
                  <Row onClick={() => this.togglePanel(dependency)}>
                    <RowSection>
                      <Cell breakWord>
                        {dependency.outdated && <OutdatedIcon>!</OutdatedIcon>}
                        <Name outdated={dependency.outdated}>
                          {' '}
                          <Text size="sm2" spacing="medium">
                            {dependency.name}
                          </Text>
                        </Name>
                      </Cell>
                    </RowSection>
                    <RowSection>
                      <Cell numeric>
                        <Text size="sm2" spacing="medium">
                          {dependency.version}
                        </Text>
                      </Cell>
                      <Cell breakWord>
                        <Text size="sm2" spacing="medium">
                          {dependency.type}
                        </Text>
                      </Cell>
                    </RowSection>
                    <Ink />
                  </Row>
                )}
              />
            </PanelWrapper>
          );
        })}

        <Modal
          isActive={!!this.state.modalOpen}
          onRequestClose={this.handleModalRequestClose}
          title="Are you sure?"
          renderBody={() =>
            this.state.expandedDependency && (
              <Text tag="p" size="s0">
                {'Are you sure you want to remove'}
                <Text font="'Roboto Mono',monospace">{` ${
                  this.state.expandedDependency.name
                }`}</Text>
                {'?'}
              </Text>
            )
          }
          renderFooter={() =>
            this.state.expandedDependency && (
              <Fragment>
                <Button type="ghost" onClick={this.handleModalRequestClose}>
                  Cancel
                </Button>
                <Spacing left="sm" />
                <Button
                  type="error"
                  icon={
                    <PoseGroup>
                      {this.state.deletingDependency ? (
                        <IconHolder key="deletingDependency">
                          <Spinner size="md" colour="white" lineWidth={3} />
                        </IconHolder>
                      ) : (
                        <IconHolder key="notDeletingDependency">
                          <DeleteIcon />
                        </IconHolder>
                      )}
                    </PoseGroup>
                  }
                  onClick={this.handleDependencyDelete}
                >
                  Remove
                </Button>
              </Fragment>
            )
          }
        />
      </Fragment>
    );
  }
}

export default withDependencies(DependenciesList);
