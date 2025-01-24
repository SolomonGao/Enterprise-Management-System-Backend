import { name } from 'ejs';
import { Table, Column, Model, DataType, HasMany, BelongsToMany, ForeignKey } from 'sequelize-typescript';
import LeafMaterialModel from './leaf.materials.model';
import ProductMaterialModel from './produict.material.model';

export interface IProduct {
    idproduct: string;
    model_name: string;
    pump_model: string;
    drawing_no_id: string;
    manufacturer: string;
    drawing_no_public_id?: string,
    drawing_no_secure_url?: string,
    version: number;
    finished_products: number;
}


@Table({
    tableName: 'products'
})
export default class ProductModel extends Model<IProduct> {
    @Column({
        primaryKey: true,
        allowNull: false
    })
    idproduct!: string; // 非空断言

    @Column
    model_name!: string;

    @Column
    pump_model!: string;

    @Column
    drawing_no_id!: string;

    @Column({
        type: DataType.BLOB('long'),
        allowNull: true,
    })
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    drawing_no_public_id?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    drawing_no_secure_url?: string;

    @Column
    manufacturer!: string;

    @Column({
        field: "created_at",
    })
    createdAt?: Date;

    @Column({
        field: "updated_at",
    })
    updatedAt?: Date;

    @Column({
        defaultValue: 0,
        allowNull: false,
        type: DataType.INTEGER,
    })
    version!: number;

    @Column({
        type: DataType.NUMBER,
        allowNull: true
    })
    finished_products?: number;

    @BelongsToMany(() => LeafMaterialModel, () => ProductMaterialModel, 'products_idproduct', 'leaf_materials_drawing_no')
    leafMaterials?: LeafMaterialModel[];

}