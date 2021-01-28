
/**
 * 更新数据
 * @param {} ModelObj  对应的表model
 * @param {*} queryObj 查询条件：object
 * @param {*} data 包含需要更新字段的object
 */
async function updateData(ModelObj, queryObj, data){
    let result = await findData(ModelObj, queryObj);
    if(result.length){
        let o1 = result[0];
        let new_obj = Object.assign(o1, data);
        await new_obj.save();
    }
}

/**
 * 查询是否存在数据，返回查询结果列表
 * @param {} ModelObj 对应的表model
 * @param {*} queryObj 查询条件：object
 */
async function findData(ModelObj, queryObj){
    let result = await ModelObj.findAll({
        where: queryObj
    });
    return result;
}

module.exports = {
    updateData,
    findData
}