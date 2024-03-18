import React, { memo, useCallback } from 'react';
import { DataProvider, LayoutProvider, RecyclerListView } from 'recyclerlistview';
import { ScreenWidth } from '../../Constant';
import FormsItem from '../FormsItem';
const FormsList = (props) =>
{
	let dataProvider = new DataProvider((r1, r2) => r1 !== r2).cloneWithRows([...props.applications])
	const NORMAL = "NORMAL";
	
	const layoutProvider = new LayoutProvider((index) => {
		return NORMAL
	}, (type, dim) =>
	{
		switch (type) {
			case NORMAL:
				dim.width = ScreenWidth,
				dim.height = 78
				break;
			default:
				dim.width = 0,
				dim.height = 0
				break;
		}
	});

	
  const rowRenderer = useCallback((type, item) => {
    return (
      <FormsItem
        {...{data: item}} 
        onSubmit={props.onSubmit}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
      />
    );
  }, [
    props.onSubmit,
    props.onEdit,
    props.onDelete,
  ]);

    return (
			<RecyclerListView
				dataProvider={dataProvider}
				layoutProvider={layoutProvider}
				rowRenderer={rowRenderer}
			/>	
    )
};



export default memo(FormsList, (prev, props) => prev.applications == props.applications);